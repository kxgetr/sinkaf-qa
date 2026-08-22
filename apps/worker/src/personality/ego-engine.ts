import { EgoState } from "./personality-types";
import { BugSeverity } from "../agent/qa-agent-state";

export class EgoEngine {
  public state: EgoState;

  constructor() {
    this.state = {
      superiority: 45,
      irritation: 20,
      contempt: 15,
      confidence: 70,
      victory: 10
    };
  }

  private clamp(val: number) {
    return Math.max(0, Math.min(100, val));
  }

  private apply(delta: Partial<EgoState>) {
    if (delta.superiority) this.state.superiority = this.clamp(this.state.superiority + delta.superiority);
    if (delta.irritation) this.state.irritation = this.clamp(this.state.irritation + delta.irritation);
    if (delta.contempt) this.state.contempt = this.clamp(this.state.contempt + delta.contempt);
    if (delta.confidence) this.state.confidence = this.clamp(this.state.confidence + delta.confidence);
    if (delta.victory) this.state.victory = this.clamp(this.state.victory + delta.victory);
  }

  recordBug(severity: BugSeverity) {
    if (severity === "low") {
      this.apply({ superiority: 2, contempt: 1 });
    } else if (severity === "medium") {
      this.apply({ superiority: 4, irritation: 3, contempt: 3 });
    } else if (severity === "high") {
      this.apply({ superiority: 8, irritation: 8, contempt: 7, victory: 5 });
    } else if (severity === "critical") {
      this.apply({ superiority: 15, irritation: 15, contempt: 12, victory: 20 });
    }
  }

  recordRegression() {
    this.apply({ irritation: 10, contempt: 12 });
  }

  recordFalsePositive() {
    this.apply({ confidence: -8, superiority: -5 });
  }

  recordSelfCorrection() {
    this.apply({ confidence: 4 });
  }

  recordInfraFailure() {
    this.apply({ irritation: 12, victory: -5 });
  }
}
