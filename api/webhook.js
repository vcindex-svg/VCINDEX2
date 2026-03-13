import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Use service role key so webhook can bypass RLS and write to any row
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Read raw body from the request stream (required for Stripe signature verification)
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── 1. Verify the Stripe signature ───────────────────────────────────────
  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('[webhook] Received event:', event.type);

  // ── 2. Handle each event type ─────────────────────────────────────────────
  try {
    switch (event.type) {

      // ── Payment succeeded: activate subscription ──────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { userId, userEmail, plan } = session.metadata ?? {};

        if (!userId) {
          console.error('[webhook] checkout.session.completed: missing userId in metadata');
          break;
        }

        const now = new Date();
        const end = new Date(now);
        if (plan === 'monthly') end.setMonth(end.getMonth() + 1);
        else end.setFullYear(end.getFullYear() + 1);

        const { error } = await supabase
          .from('creator_profiles')
          .upsert(
            {
              user_id: userId,
              created_by: userEmail,
              subscription_plan: plan,
              subscription_status: 'active',
              subscription_start_date: now.toISOString().split('T')[0],
              subscription_end_date: end.toISOString().split('T')[0],
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
            },
            { onConflict: 'user_id' }
          );

        if (error) console.error('[webhook] Supabase upsert error:', error.message);
        else console.log('[webhook] Subscription activated for user:', userId);
        break;
      }

      // ── Renewal payment succeeded: extend subscription end date ───────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        if (invoice.billing_reason !== 'subscription_cycle') break; // skip first payment (handled above)

        const subId = invoice.subscription;
        const stripeSub = await stripe.subscriptions.retrieve(subId);
        const plan = stripeSub.metadata?.plan;

        const now = new Date();
        const end = new Date(now);
        if (plan === 'monthly') end.setMonth(end.getMonth() + 1);
        else end.setFullYear(end.getFullYear() + 1);

        const { error } = await supabase
          .from('creator_profiles')
          .update({
            subscription_status: 'active',
            subscription_end_date: end.toISOString().split('T')[0],
          })
          .eq('stripe_subscription_id', subId);

        if (error) console.error('[webhook] Renewal update error:', error.message);
        else console.log('[webhook] Subscription renewed:', subId);
        break;
      }

      // ── Payment failed: mark as past_due ──────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subId = invoice.subscription;

        const { error } = await supabase
          .from('creator_profiles')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_subscription_id', subId);

        if (error) console.error('[webhook] Payment failed update error:', error.message);
        else console.log('[webhook] Marked past_due for subscription:', subId);
        break;
      }

      // ── Subscription cancelled ────────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object;

        const { error } = await supabase
          .from('creator_profiles')
          .update({ subscription_status: 'cancelled' })
          .eq('stripe_subscription_id', sub.id);

        if (error) console.error('[webhook] Cancellation update error:', error.message);
        else console.log('[webhook] Subscription cancelled:', sub.id);
        break;
      }

      // ── Subscription paused / updated ─────────────────────────────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const newStatus = sub.status === 'active' ? 'active'
          : sub.status === 'past_due' ? 'past_due'
          : sub.status === 'canceled' ? 'cancelled'
          : 'inactive';

        const { error } = await supabase
          .from('creator_profiles')
          .update({ subscription_status: newStatus })
          .eq('stripe_subscription_id', sub.id);

        if (error) console.error('[webhook] Subscription update error:', error.message);
        else console.log('[webhook] Subscription updated to:', newStatus, 'for:', sub.id);
        break;
      }

      default:
        console.log('[webhook] Unhandled event type:', event.type);
    }
  } catch (err) {
    console.error('[webhook] Handler error:', err.message);
    return res.status(500).json({ error: 'Internal handler error' });
  }

  // ── 3. Always return 200 so Stripe doesn't retry ──────────────────────────
  res.status(200).json({ received: true });
}
