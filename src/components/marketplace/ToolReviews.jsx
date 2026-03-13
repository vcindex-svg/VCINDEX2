import db from '@/api/base44Client';

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Star } from "lucide-react";

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="transition-colors"
        >
          <Star className={`w-6 h-6 ${n <= (hovered || value) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`w-3.5 h-3.5 ${n <= value ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"}`} />
      ))}
    </div>
  );
}

export default function ToolReviews({ toolId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const init = async () => {
      const [revs, isAuth] = await Promise.all([
        db.entities.Review.filter({ tool_id: toolId }, "-created_date"),
        db.auth.isAuthenticated(),
      ]);
      setReviews(revs);
      if (isAuth) {
        const u = await db.auth.me();
        setUser(u);
        if (revs.find((r) => r.user_id === u.id)) setSubmitted(true);
      }
      setLoading(false);
    };
    init();
  }, [toolId]);

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    const created = await db.entities.Review.create({ tool_id: toolId, rating, feedback });
    const updatedReviews = [created, ...reviews];
    setReviews(updatedReviews);
    setSubmitted(true);
    setSubmitting(false);

    // Update tool's avg_rating and review_count
    const avg = updatedReviews.reduce((s, r) => s + r.rating, 0) / updatedReviews.length;
    await db.entities.Tool.update(toolId, {
      avg_rating: Math.round(avg * 10) / 10,
      review_count: updatedReviews.length,
    });
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="border-t border-border/40 pt-5 mt-2 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm font-mono uppercase tracking-wider">Reviews</h3>
        {avgRating && (
          <div className="flex items-center gap-2">
            <StarDisplay value={Math.round(Number(avgRating))} />
            <span className="text-amber-400 font-bold text-sm">{avgRating}</span>
            <span className="text-muted-foreground text-xs">({reviews.length})</span>
          </div>
        )}
      </div>

      {user && !submitted && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">Leave your rating</p>
          <StarPicker value={rating} onChange={setRating} />
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience… (optional)"
            rows={2}
            className="bg-surface border-border/60 resize-none text-sm"
          />
          <Button
            onClick={handleSubmit}
            disabled={submitting || !rating}
            size="sm"
            className="self-start bg-primary hover:bg-primary/90"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
            Submit Review
          </Button>
        </div>
      )}

      {!user && (
        <p className="text-xs text-muted-foreground italic">
          <button onClick={() => db.auth.redirectToLogin(window.location.href)} className="text-primary underline hover:no-underline">Sign in</button> to leave a review.
        </p>
      )}

      {submitted && <p className="text-xs text-emerald-400 font-mono">✓ You reviewed this tool</p>}

      {loading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 text-primary animate-spin" /></div>
      ) : reviews.length === 0 ? (
        <p className="text-xs text-muted-foreground/50 italic text-center py-2">No reviews yet. Be the first!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-lg bg-white/[0.02] border border-border/30 p-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <StarDisplay value={r.rating} />
                <span className="text-[10px] text-muted-foreground/50 font-mono">{r.created_by?.split("@")[0]}</span>
              </div>
              {r.feedback && <p className="text-sm text-foreground/70 leading-relaxed">{r.feedback}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}