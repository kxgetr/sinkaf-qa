import { PersonalityInput, PersonalityOutput, RoastMode } from "./personality-types";
import { composeNormal, composeHeavy } from "./composer/normal-composer";
import { composeDestan } from "./composer/destan-composer";
import { DefaultLexicon } from "./lexicon-loader";

function sample(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class SinkafReactor {
  
  private determineMode(input: PersonalityInput): RoastMode {
    if (input.runSummary && input.runSummary.bugs >= 10) return "DESTAN";
    
    if (input.finding) {
      const severity = input.finding.severity;
      const r = Math.random();
      if (severity === "low") return r < 0.9 ? "NORMAL" : "HEAVY";
      if (severity === "medium") return r < 0.4 ? "NORMAL" : "HEAVY";
      if (severity === "high") return r < 0.1 ? "NORMAL" : (r < 0.8 ? "HEAVY" : "DESTAN");
      if (severity === "critical") return r < 0.5 ? "HEAVY" : "DESTAN";
    }
    return "NORMAL";
  }

  public generate(input: PersonalityInput): PersonalityOutput {
    if (input.infraError) {
      return {
        mode: "NORMAL",
        comment: sample(DefaultLexicon.self_roasts)
      };
    }

    if (input.runSummary && input.runSummary.bugs === 0) {
      return {
        mode: "NORMAL",
        comment: "Bir bok bulamadım. Şimdilik şerefsiz sağlam çıktı."
      };
    }

    const mode = this.determineMode(input);
    
    let comment = "";
    if (mode === "NORMAL") comment = composeNormal(input);
    else if (mode === "HEAVY") comment = composeHeavy(input);
    else comment = composeDestan(input);

    return {
      mode,
      comment
    };
  }
}
