import { PersonalityInput } from "../personality-types";
import { DefaultLexicon } from "../lexicon-loader";

function sample(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function composeNormal(input: PersonalityInput): string {
  const reaction = sample(DefaultLexicon.reactions);
  let tech = "";
  
  const area = input.judgement.likelyRootArea;
  
  if (input.context === "REGRESSION") {
    tech = sample(DefaultLexicon.tech_roasts["regression"]);
  } else if (input.context === "RECURRING_BUG") {
    tech = sample(DefaultLexicon.tech_roasts["recurring"]);
  } else if (DefaultLexicon.tech_roasts[area]) {
    tech = sample(DefaultLexicon.tech_roasts[area]);
  } else {
    tech = sample(DefaultLexicon.failure);
  }

  const observation = input.finding ? `${input.finding.description}` : "";
  const punchline = sample(DefaultLexicon.punchlines);

  // e.g. "Hassiktir. Form ne verirsen yiyor amk. Özetle komple yarrağı yemişsiniz."
  let result = `${reaction}. `;
  if (observation) result += `${observation}. `;
  result += `${tech}. ${punchline}`;

  return result;
}

export function composeHeavy(input: PersonalityInput): string {
  const normal = composeNormal(input);
  const mockery = sample(DefaultLexicon.mockery);
  return `${normal} ${mockery}`;
}
