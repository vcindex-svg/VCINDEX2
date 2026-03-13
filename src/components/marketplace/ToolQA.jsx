import db from '@/api/base44Client';

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, ChevronDown, ChevronUp, Loader2, CheckCircle } from "lucide-react";

function QAItem({ qa, currentUser, toolCreator, onAnswer }) {
  const [showAnswerBox, setShowAnswerBox] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [saving, setSaving] = useState(false);
  const isCreator = currentUser?.email === toolCreator;

  const handleAnswer = async () => {
    if (!answerText.trim()) return;
    setSaving(true);
    await onAnswer(qa.id, answerText.trim());
    setAnswerText("");
    setShowAnswerBox(false);
    setSaving(false);
  };

  return (
    <div className="border border-border/40 rounded-xl p-4 bg-white/[0.02]">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-primary text-[10px] font-bold">Q</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground">{qa.question}</p>
          <p className="text-[11px] text-muted-foreground mt-1 font-mono">@{qa.created_by?.split("@")[0]}</p>

          {qa.answer ? (
            <div className="mt-3 pl-3 border-l-2 border-emerald-500/40">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span className="text-[11px] text-emerald-400 font-mono">Answered by creator</span>
              </div>
              <p className="text-sm text-foreground/80">{qa.answer}</p>
            </div>
          ) : isCreator ? (
            <div className="mt-2">
              {!showAnswerBox ? (
                <button
                  onClick={() => setShowAnswerBox(true)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <ChevronDown className="w-3 h-3" /> Answer this
                </button>
              ) : (
                <div className="mt-2 flex flex-col gap-2">
                  <Textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Write your answer..."
                    rows={2}
                    className="bg-surface border-border/60 resize-none text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAnswer} disabled={saving || !answerText.trim()} className="bg-primary hover:bg-primary/90 h-7 text-xs">
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3 mr-1" />}
                      Post Answer
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowAnswerBox(false)} className="h-7 text-xs text-muted-foreground">
                      <ChevronUp className="w-3 h-3 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground/50 mt-2 italic">Awaiting answer from creator</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ToolQA({ toolId, toolCreator }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [posting, setPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const init = async () => {
      const auth = await db.auth.isAuthenticated();
      setIsAuth(auth);
      if (auth) {
        const u = await db.auth.me();
        setCurrentUser(u);
      }
      const qs = await db.entities.ToolQA.filter({ tool_id: toolId }, "-created_date");
      setQuestions(qs);
      setLoading(false);
    };
    init();
  }, [toolId]);

  const handleAsk = async () => {
    if (!newQuestion.trim()) return;
    if (!isAuth) { db.auth.redirectToLogin(window.location.href); return; }
    setPosting(true);
    const q = await db.entities.ToolQA.create({ tool_id: toolId, question: newQuestion.trim() });
    setQuestions((prev) => [q, ...prev]);
    setNewQuestion("");
    setPosting(false);
  };

  const handleAnswer = async (qaId, answerText) => {
    const updated = await db.entities.ToolQA.update(qaId, {
      answer: answerText,
      answered_by: currentUser?.id,
    });
    setQuestions((prev) => prev.map((q) => q.id === qaId ? updated : q));
  };

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Community Q&A</h3>
        {questions.length > 0 && (
          <span className="text-xs text-muted-foreground font-mono">({questions.length})</span>
        )}
      </div>

      {/* Ask a question */}
      <div className="flex gap-2 mb-5">
        <Textarea
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder={isAuth ? "Ask a question about this tool..." : "Sign in to ask a question"}
          rows={2}
          disabled={!isAuth}
          className="bg-surface border-border/60 resize-none text-sm flex-1"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
        />
        <Button
          onClick={isAuth ? handleAsk : () => db.auth.redirectToLogin(window.location.href)}
          disabled={posting || (isAuth && !newQuestion.trim())}
          className="bg-primary hover:bg-primary/90 self-end px-3"
          size="sm"
        >
          {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>

      {/* Questions list */}
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        </div>
      ) : questions.length === 0 ? (
        <p className="text-sm text-muted-foreground/60 text-center py-4 italic">No questions yet — be the first to ask!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {questions.map((qa) => (
            <QAItem key={qa.id} qa={qa} currentUser={currentUser} toolCreator={toolCreator} onAnswer={handleAnswer} />
          ))}
        </div>
      )}
    </div>
  );
}