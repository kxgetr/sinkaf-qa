import { PhraseHistory } from "./personality-types";

export class PhraseTracker {
  public history: PhraseHistory;
  private readonly LIMIT = 20;

  constructor() {
    this.history = {
      openings: [],
      profanity: [],
      metaphors: [],
      punchlines: []
    };
  }

  private add(list: string[], item: string) {
    list.push(item);
    if (list.length > this.LIMIT) {
      list.shift();
    }
  }

  recordOpening(val: string) { this.add(this.history.openings, val); }
  recordProfanity(val: string) { this.add(this.history.profanity, val); }
  recordMetaphor(val: string) { this.add(this.history.metaphors, val); }
  recordPunchline(val: string) { this.add(this.history.punchlines, val); }

  getPenalty(category: keyof PhraseHistory, phrase: string): number {
    const list = this.history[category];
    const idx = list.lastIndexOf(phrase);
    if (idx === -1) return 0;
    
    // The more recent it is, the higher the penalty
    // idx = 19 (most recent) -> penalty = 0.95
    // idx = 0 (oldest) -> penalty = 0.05
    return (idx + 1) / list.length; 
  }
}
