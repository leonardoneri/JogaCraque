
import { Player, Position, Rarity, PlayerAttributes, COUNTRIES, MatchEventType } from '../types.js';

// Helper to generate a random number within a range
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const FIRST_NAMES = ['Gabriel', 'Lucas', 'Matheus', 'Pedro', 'Rafael', 'Leo', 'Bruno', 'Thiago', 'Igor', 'Felipe', 'Alejandro', 'Diego', 'Carlos', 'Neymar', 'Vinicius', 'Rodrygo'];
const LAST_NAMES = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Junior', 'Paqueta'];
const CLUBS = ['Flamengo', 'Palmeiras', 'Real Madrid', 'Barcelona', 'Manchester City', 'Liverpool', 'PSG', 'Bayern', 'Juventus', 'Milan', 'Boca Juniors', 'River Plate'];

export const generatePlayer = (forcedRarity?: Rarity, forcedPosition?: Position): Player => {
  let rarity = forcedRarity;
  if (!rarity) {
    const roll = Math.random();
    if (roll < 0.6) rarity = Rarity.COMMON;
    else if (roll < 0.85) rarity = Rarity.RARE;
    else if (roll < 0.98) rarity = Rarity.EPIC;
    else rarity = Rarity.LEGENDARY;
  }

  let minRating = 50;
  let maxRating = 99;
  
  switch (rarity) {
    case Rarity.COMMON: minRating = 55; maxRating = 74; break;
    case Rarity.RARE: minRating = 75; maxRating = 84; break;
    case Rarity.EPIC: minRating = 85; maxRating = 92; break;
    case Rarity.LEGENDARY: minRating = 93; maxRating = 99; break;
  }

  const rating = randomInt(minRating, maxRating);
  
  let position = forcedPosition;
  if (!position) {
    const posKeys = Object.values(Position);
    position = posKeys[randomInt(0, posKeys.length - 1)] as Position;
  }

  const nationality = COUNTRIES[randomInt(0, COUNTRIES.length - 1)];
  const club = CLUBS[randomInt(0, CLUBS.length - 1)];

  const genAttr = (base: number) => Math.min(99, Math.max(1, base + randomInt(-5, 5)));
  
  const attributes: PlayerAttributes = {
    pace: genAttr(rating),
    shooting: genAttr(rating),
    passing: genAttr(rating),
    dribbling: genAttr(rating),
    defending: genAttr(rating),
    physical: genAttr(rating),
    vision: genAttr(rating),
    positioning: genAttr(rating),
  };

  // Weight attributes based on position
  if (position === Position.GK) {
    attributes.pace = genAttr(rating - 30);
    attributes.shooting = genAttr(rating - 40);
    attributes.passing = genAttr(rating - 10);
    attributes.dribbling = genAttr(rating - 30);
    attributes.defending = genAttr(rating + 5); // Reflexes
    attributes.physical = genAttr(rating);
    attributes.positioning = genAttr(rating + 2);
  } else if ([Position.CB, Position.LB, Position.RB, Position.CDM].includes(position)) {
    attributes.defending = genAttr(rating + 4);
    attributes.physical = genAttr(rating + 3);
    attributes.shooting = genAttr(rating - 15);
    attributes.positioning = genAttr(rating + 2);
    attributes.pace = [Position.LB, Position.RB].includes(position) ? genAttr(rating + 2) : genAttr(rating - 5);
  } else if ([Position.CM, Position.CAM, Position.LM, Position.RM].includes(position)) {
    attributes.passing = genAttr(rating + 4);
    attributes.dribbling = genAttr(rating + 3);
    attributes.vision = genAttr(rating + 5);
    attributes.defending = genAttr(rating - 10);
  } else if ([Position.ST, Position.LW, Position.RW].includes(position)) {
    attributes.shooting = genAttr(rating + 5);
    attributes.pace = genAttr(rating + 4);
    attributes.defending = genAttr(rating - 25);
    attributes.physical = genAttr(rating - 5);
    attributes.positioning = genAttr(rating + 5);
  }

  const player: Player = {
    id: `p-${Date.now()}-${randomInt(0, 9999)}`,
    name: `${FIRST_NAMES[randomInt(0, FIRST_NAMES.length - 1)]} ${LAST_NAMES[randomInt(0, LAST_NAMES.length - 1)]}`,
    position,
    nationality,
    club,
    collection: 'Base',
    rarity,
    rating,
    attributes,
    level: 1,
    xp: 0,
    image: `https://picsum.photos/seed/${randomInt(1000, 9999)}/200/200`,
    stats: {
      goals: 0,
      matches: 0,
      assists: 0
    }
  };

  player.marketValue = calculatePlayerValue(player);
  return player;
};

export const calculatePlayerValue = (player: Player): number => {
  let base = 0;
  switch (player.rarity) {
    case Rarity.COMMON: base = 100; break;
    case Rarity.RARE: base = 500; break;
    case Rarity.EPIC: base = 2500; break;
    case Rarity.LEGENDARY: base = 10000; break;
  }
  const multiplier = 1 + ((player.rating - 50) / 50);
  return Math.floor(base * multiplier);
};

export const calculateTeamRating = (squad: (Player | null)[]): number => {
  const players = squad.filter((p): p is Player => p !== null);
  if (players.length === 0) return 0;
  const total = players.reduce((acc, p) => acc + p.rating, 0);
  return Math.floor(total / 11);
};

export const calculateWinRate = (wins: number, matches: number): number => {
  if (matches === 0) return 0;
  return Math.round((wins / matches) * 100);
};

export const INITIAL_SQUAD_POSITIONS: Position[] = [
  Position.GK,
  Position.LB, Position.CB, Position.CB, Position.RB,
  Position.CM, Position.CDM, Position.CM,
  Position.LW, Position.ST, Position.RW
];

// ------------------------------------------------------------------
// COMMENTARY SYSTEM
// ------------------------------------------------------------------

const COMMENTARY_TEMPLATES: Partial<Record<MatchEventType, string[]>> = {
  GOAL: [
    "{playerName} finaliza com frieza e estufa a rede! GOOOL!",
    "Bola na rede! {playerName} não perdoa na cara do gol! GOOOL!",
    "É caixa! {playerName} recebe e guarda lá dentro! GOOOL!",
    "Aparece {playerName} para definir a jogada! GOOOL!"
  ],
  GOAL_LONG: [
    "QUE GOLAÇO! {playerName} solta uma bomba de fora da área!",
    "DO MEIO DA RUA! {playerName} acerta um chute indefensável!",
    "PINTURA! {playerName} viu o goleiro adiantado e mandou um foguete!",
    "No ângulo! {playerName} acerta um chute magistral de longe!"
  ],
  GOAL_HEADER: [
    "Testa firme de {playerName} para o fundo do gol!",
    "Subiu no terceiro andar! Golaço de cabeça de {playerName}!",
    "Cruzamento na medida e {playerName} confere de cabeça!",
    "O goleiro nem se mexeu! Cabeçada fatal de {playerName}!"
  ],
  GOAL_BICYCLE: [
    "ANTOLÓGICO! {playerName} marca de BICICLETA!",
    "PARA TUDO! {playerName} faz uma acrobacia e marca um golaço!",
    "QUE ESPETÁCULO! Gol de bicicleta de {playerName}!",
    "Merece placa! {playerName} acerta uma bicicleta perfeita!"
  ],
  GOAL_OLYMPIC: [
    "GOL OLÍMPICO! {playerName} surpreende a todos na cobrança!",
    "Direto para o gol! {playerName} faz um gol olímpico incrível!",
    "Que efeito! A bola de {playerName} entra direto do escanteio!",
    "Histórico! Gol olímpico de {playerName}!"
  ],
  GOAL_FK: [
    "Na gaveta! {playerName} cobra a falta com perfeição!",
    "Que categoria! {playerName} coloca a bola onde a coruja dorme!",
    "O goleiro voou mas não achou nada! Golaço de falta de {playerName}!",
    "Cobrança magistral de {playerName}!"
  ],
  GOAL_PENALTY: [
    "Com categoria! {playerName} desloca o goleiro e marca!",
    "Bateu firme! {playerName} converte a penalidade!",
    "Bola para um lado, goleiro para o outro. Gol de {playerName}!",
    "Sangue frio! {playerName} não treme e faz o gol!"
  ],
  
  // Dribles e Habilidade (Sem prometer chute)
  SKILL_MOVE: [
    "{playerName} deixa o marcador na saudade com um drible seco!",
    "Que pedalada! {playerName} quebra a espinha do zagueiro!",
    "{playerName} passa fácil pela marcação e invade a área!",
    "Caneta desmoralizante de {playerName}! O ataque flui!",
    "Ginga pura! {playerName} abre clareira na defesa!"
  ],
  DRIBBLE_SIMPLE: [
    "{playerName} arranca com a bola dominada pelo meio.",
    "Bela condução de {playerName}, ganhando metros importantes.",
    "{playerName} protege bem a bola e avança.",
    "{playerName} sai da pressão com um toque curto."
  ],

  // Passes
  PASS_ATTACKING: [
    "{playerName} descola um passe genial entre os zagueiros!",
    "Visão de jogo incrível de {playerName}, deixando o companheiro na boa!",
    "Passe açucarado de {playerName} rasgando a defesa!",
    "{playerName} inverte o jogo rapidamente buscando o ponta!",
    "Tabelinha envolvente iniciada por {playerName}!"
  ],
  PASS_DEFENSIVE: [
    "{playerName} roda a bola com paciência na defesa.",
    "Sai jogando com tranquilidade {playerName}.",
    "{playerName} recua para o goleiro e reorganiza o time.",
    "Troca de passes segura comandada por {playerName}."
  ],
  BUILDUP: [
    "{teamName} valoriza a posse de bola.",
    "A bola gira de um lado para o outro no {teamName}.",
    "{teamName} procura espaços na retranca adversária.",
    "Organização tática do {teamName} controla o ritmo."
  ],

  // Defesa
  INTERCEPTION: [
    "Leitura perfeita! A defesa do {teamName} corta o passe.",
    "Interceptação crucial para matar o contra-ataque!",
    "O passe era bom, mas a zaga do {teamName} estava atenta.",
    "Recuperação de bola importante no meio-campo."
  ],
  TACKLE: [
    "Desarme cirúrgico! {playerName} rouba a bola limpa.",
    "Chegada firme de {playerName} para travar a jogada!",
    "O zagueiro ganha a disputa no corpo. Segue o jogo.",
    "Muro de concreto! {playerName} não deixa passar nada."
  ],
  SAVE: [
    "ESPETACULAR O GOLEIRO! Evita o gol certo de {playerName}!",
    "Que reflexo! O goleiro opera um milagre no chute de {playerName}!",
    "Mão trocada! O goleiro vai buscar no ângulo!",
    "O goleiro cresce na frente de {playerName} e faz a defesa!"
  ],
  BLOCKED_SHOT: [
    "O chute de {playerName} explode na zaga!",
    "Carrinho salvador do defensor travando o chute!",
    "A parede defensiva bloqueia a finalização de {playerName}."
  ],
  MISS: [
    "INACREDITÁVEL! {playerName} perde um gol feito!",
    "Tirou tinta da trave! Quase gol de {playerName}!",
    "Isolou! {playerName} pega muito mal na bola.",
    "Passou raspando! {playerName} leva as mãos à cabeça!"
  ],

  // VAR
  VAR_CHECK: [
    "Opa! O árbitro põe a mão no ouvido. VAR em análise!",
    "Tem polêmica! O lance do gol está sendo revisado.",
    "Momento de tensão. O árbitro vai à cabine do VAR!",
    "O jogo para. VAR traçando as linhas de impedimento."
  ],
  VAR_CONFIRMED: [
    "GOL LEGAL! O árbitro aponta para o centro após o VAR!",
    "Sem irregularidade! O VAR confirma o gol!",
    "A torcida celebra de novo! Gol validado pelo vídeo!",
    "Tudo certo no lance. O placar é atualizado!"
  ],
  VAR_ANNULLED: [
    "NÃO VALEU! O árbitro anula o gol após ver o VAR.",
    "Impedimento milimétrico detectado! Gol anulado.",
    "Frustração total! O VAR pega uma falta na origem. Gol invalidado.",
    "Volta tudo! O placar não muda, gol anulado."
  ],

  // Set Pieces
  CORNER: [
    "Bola desviada! É escanteio para o {teamName}.",
    "O goleiro espalma pela linha de fundo. Escanteio!",
    "Chance na bola parada. Escanteio para o {teamName}."
  ],
  FREE_KICK: [
    "Falta perigosa na entrada da área para o {teamName}!",
    "O árbitro marca falta em posição frontal. Perigo!",
    "Boa chance para o {teamName} na bola parada."
  ],
  FREEKICK_PASS: [
    "{playerName} prefere o toque curto na cobrança.",
    "Jogada ensaiada, {playerName} rola para o lado.",
    "Cobrança rápida para pegar a defesa desprevenida."
  ],
  FREEKICK_CROSS: [
    "{playerName} lança a bola na confusão da área!",
    "Bola viajando para o segundo pau na cobrança de {playerName}!",
    "Cruzamento venenoso de {playerName}!"
  ],
  PENALTY_AWARDED: [
    "É PÊNALTI! O árbitro não hesita e aponta a marca da cal!",
    "Derrubado na área! Pênalti claro para o {teamName}!",
    "A zaga chega atrasada e comete o pênalti!"
  ],

  // Game Flow
  SUBSTITUTION: [
    "O treinador do {teamName} mexe no time.",
    "Vem alteração no {teamName} para tentar mudar o jogo."
  ],
  FOUL: [
    "O árbitro para o jogo. Falta para o {teamName}.",
    "Chegada atrasada. Falta marcada.",
    "O jogo fica picotado com muitas faltas."
  ],
  CARD_YELLOW: [
    "Cartão amarelo para {playerName} por reclamação.",
    "Entrada temerária e o árbitro mostra o amarelo para {playerName}.",
    "{playerName} está pendurado. Cartão amarelo."
  ],
  CARD_RED: [
    "RUA! {playerName} é expulso direto!",
    "O árbitro não teve dúvida. Vermelho para {playerName}!",
    "Inresponsabilidade! {playerName} deixa o time com um a menos."
  ],
  OFFSIDE: [
    "Não valeu nada! O bandeira marca impedimento de {teamName}.",
    "{playerName} estava um passo à frente. Impedimento."
  ],
  START: [
    "Apita o árbitro! Começa a emoção de {teamName} x {opposingTeam}!",
    "Tudo pronto! Bola rolando para o duelo!",
    "Autoriza o árbitro, vamos para os primeiros 45 minutos!"
  ],
  SECOND_HALF_START: [
    "Times de volta! Começa o segundo tempo.",
    "A bola volta a rolar para a etapa final!",
    "Vamos para os 45 minutos finais. Tudo em aberto!"
  ],
  HALF_TIME: [
    "Fim de papo no primeiro tempo. {scoreHome} a {scoreAway}.",
    "Intervalo de jogo. As equipes vão para o vestiário.",
    "45 minutos de muita disputa. Intervalo!"
  ],
  FULL_TIME: [
    "FIM DE JOGO! Vitória e derrota decididas no apito final!",
    "Acaba o espetáculo! Placar final: {scoreHome} x {scoreAway}.",
    "O árbitro encerra a partida! Que jogo tivemos hoje!"
  ],
  KICKOFF: [
    "Saída de bola autorizada para o {teamName}.",
    "O {teamName} recomeça o jogo no meio-campo.",
    "Bola em jogo novamente."
  ]
};

interface CommentaryContext {
  playerName?: string;
  teamName?: string;
  opposingTeam?: string;
  scoreHome?: number;
  scoreAway?: number;
}

export const getCommentary = (type: MatchEventType, context: CommentaryContext): string => {
  const templates = COMMENTARY_TEMPLATES[type] || [`Evento: ${type}`];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  return template
    .replace('{playerName}', context.playerName || 'Jogador')
    .replace('{teamName}', context.teamName || 'Time')
    .replace('{opposingTeam}', context.opposingTeam || 'Adversário')
    .replace('{scoreHome}', (context.scoreHome || 0).toString())
    .replace('{scoreAway}', (context.scoreAway || 0).toString());
};