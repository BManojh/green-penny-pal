import { EcoSuggestions } from "@/components/EcoSuggestions";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Lightbulb, Brain, Sparkles } from "lucide-react";

const Insights = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10">
          <Lightbulb className="h-5 w-5 text-purple-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Insights</h1>
          <p className="text-muted-foreground">Personalized recommendations powered by AI</p>
        </div>
      </div>

      {/* AI Features Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-500" />
            <div>
              <div className="font-semibold text-foreground">Smart Analysis</div>
              <div className="text-sm text-muted-foreground">AI analyzes your activity patterns</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-blue-500" />
            <div>
              <div className="font-semibold text-foreground">Personalized Tips</div>
              <div className="text-sm text-muted-foreground">Tailored to your lifestyle</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-8 w-8 text-yellow-500" />
            <div>
              <div className="font-semibold text-foreground">Actionable Insights</div>
              <div className="text-sm text-muted-foreground">Ready-to-implement suggestions</div>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Suggestions */}
      <EcoSuggestions userId={user.id} />
    </div>
  );
};

export default Insights;