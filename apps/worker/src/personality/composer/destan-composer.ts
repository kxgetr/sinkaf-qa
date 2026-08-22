import { PersonalityInput } from "../personality-types";
import { DefaultLexicon } from "../lexicon-loader";

function sample(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function composeDestan(input: PersonalityInput): string {
  const reaction = sample(DefaultLexicon.reactions);
  const disbelief = sample(DefaultLexicon.disbelief);
  const object = sample(DefaultLexicon.objects);
  const popculture = sample(DefaultLexicon.pop_culture);
  const mockery = sample(DefaultLexicon.mockery);
  const failure = sample(DefaultLexicon.failure);
  const punchline = sample(DefaultLexicon.punchlines);
  
  const observation = input.finding ? `${input.finding.description}` : "Sistem saçmalamış.";
  
  return `${reaction}. ${observation} Sistemin götüne ${object} sokup ${popculture} yayını mı yaptınız ne yaptınız belli değil amına koyayım. ${disbelief} Component kendi içinde ayrı, database kendi içinde ayrı ${failure}. State management öyle dağılmış ki ${popculture} açsam göç eden component sürüsü izlerim. ${mockery} Bu production'a çıkarsa kullanıcı bir işlem yapar, sistem iki tane doğurur amk. ${punchline}`;
}
