"use client";

import { FigureBody } from "@/components/Figure";
import { keyPoseOf, type Exercise } from "@/content/exercises";

/**
 * Le téléphone des visuels publicitaires, et l'écran du produit dedans.
 *
 * Montrer l'application en situation vaut mieux qu'un dessin isolé : on comprend
 * en une seconde que c'est un produit, pas une image d'illustration. L'écran
 * n'est pas une capture — c'est un redessin vectoriel de l'interface réelle, qui
 * reste net à n'importe quelle taille et n'a pas besoin qu'on aille chercher une
 * capture d'écran à chaque changement de maquette.
 *
 * Il reprend les vraies couleurs, les vrais textes d'exercice et la vraie
 * silhouette. Ce que la publicité montre est bien ce que l'abonné trouve
 * derrière.
 */

export type CouleursEcran = {
  fond: string;
  carte: string;
  texte: string;
  discret: string;
  accent: string;
  action: string;
  trait: string;
  traitClair: string;
};

export const ECRAN_SOMBRE: CouleursEcran = {
  fond: "#0a0908",
  carte: "#131110",
  texte: "#ffffff",
  discret: "#8a8078",
  accent: "#ddb13c",
  action: "#cf2f2f",
  trait: "#eacb71",
  traitClair: "#4a443e",
};

/**
 * Cadre du téléphone. Le contenu est découpé aux bords de l'écran, ce qui permet
 * de le laisser déborder par le bas comme sur les visuels du genre.
 */
export function Telephone({
  x,
  y,
  largeur,
  uid,
  basVisible,
  lueur = "or",
  children,
}: {
  x: number;
  y: number;
  largeur: number;
  /** Identifiant unique : plusieurs téléphones cohabitent sur une même page. */
  uid: string;
  /**
   * Ordonnée du bas de la slide, dans le même repère que `y`. Le fondu se
   * termine là — sans cette information, l'appareil était coupé net par le bord.
   */
  basVisible?: number;
  /**
   * Halo doré derrière l'appareil. Il détache le téléphone d'un fond uni, mais
   * sur une photo il salit la scène d'une tache jaune : on lui préfère alors
   * une ombre neutre, qui pose l'objet sans le colorer.
   */
  lueur?: "or" | "ombre";
  children: React.ReactNode;
}) {
  const hauteur = largeur * 2.05;
  const rayon = largeur * 0.115;
  const bord = largeur * 0.022;

  // Le fondu s'arrête au bord de la slide, ou au bas de l'appareil s'il tient
  // en entier. Le calage était auparavant fait à 72 % de la hauteur du
  // téléphone : dès qu'il dépassait largement du cadre, ces 72 % tombaient
  // hors champ et le bord de la slide tranchait l'écran en plein texte.
  const finFondu = Math.min(hauteur + bord * 3, (basVisible ?? Infinity) - y);
  const debutFondu = finFondu - largeur * 0.36;

  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id={`ecran-${uid}`}>
          <rect x={0} y={0} width={largeur} height={hauteur} rx={rayon} />
        </clipPath>
        <linearGradient id={`chassis-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6b635b" />
          <stop offset="18%" stopColor="#2c2825" />
          <stop offset="50%" stopColor="#15120f" />
          <stop offset="82%" stopColor="#2c2825" />
          <stop offset="100%" stopColor="#6b635b" />
        </linearGradient>
        <radialGradient id={`halo-${uid}`} cx="0.5" cy="0.5" r="0.5">
          <stop
            offset="0%"
            stopColor={lueur === "ombre" ? "#000000" : "#ddb13c"}
            stopOpacity={lueur === "ombre" ? 0.5 : 0.3}
          />
          <stop
            offset="100%"
            stopColor={lueur === "ombre" ? "#000000" : "#ddb13c"}
            stopOpacity={0}
          />
        </radialGradient>
        {/*
          Le téléphone s'efface vers le bas au lieu de s'arrêter net. C'est ce
          fondu qui fait la différence entre une capture collée sur un fond et un
          objet posé dans la scène.
        */}
        <linearGradient
          id={`fondu-${uid}`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={debutFondu}
          x2="0"
          y2={finFondu}
        >
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
        {/*
          Le masque déborde largement sur les côtés : la lueur est plus large
          que l'appareil, et un masque coupe tout ce qu'il ne couvre pas.
        */}
        <mask id={`masque-${uid}`}>
          <rect
            x={-largeur * 1.5}
            y={-hauteur}
            width={largeur * 4}
            height={hauteur * 3}
            fill={`url(#fondu-${uid})`}
          />
        </mask>
      </defs>

      <g mask={`url(#masque-${uid})`}>
        {/* Lueur derrière l'appareil : elle le détache du fond. */}
        <ellipse
          cx={largeur / 2}
          cy={hauteur * 0.42}
          rx={largeur * 1.05}
          ry={hauteur * 0.42}
          fill={`url(#halo-${uid})`}
        />
        <rect
          x={-bord}
          y={-bord}
          width={largeur + bord * 2}
          height={hauteur + bord * 2}
          rx={rayon + bord}
          fill={`url(#chassis-${uid})`}
        />
        <rect
          x={0}
          y={0}
          width={largeur}
          height={hauteur}
          rx={rayon}
          fill="#0a0908"
        />

        <g clipPath={`url(#ecran-${uid})`}>{children}</g>

        {/* Îlot dynamique : c'est lui qui fait lire « téléphone » au premier coup d'œil. */}
        <rect
          x={largeur * 0.35}
          y={largeur * 0.032}
          width={largeur * 0.3}
          height={largeur * 0.072}
          rx={largeur * 0.036}
          fill="#000000"
        />
        {/* Reflet en diagonale sur la vitre, très discret. */}
        <path
          d={`M 0 ${hauteur * 0.1} L ${largeur} ${hauteur * 0.02} L ${largeur} ${
            hauteur * 0.12
          } L 0 ${hauteur * 0.2} Z`}
          fill="#ffffff"
          opacity={0.03}
          clipPath={`url(#ecran-${uid})`}
        />
      </g>
    </g>
  );
}

/**
 * L'écran d'un exercice, redessiné.
 *
 * Toutes les dimensions sont exprimées en centièmes de la largeur du téléphone,
 * ce qui rend l'écran identique quelle que soit la taille de la maquette.
 */
export function EcranExercice({
  largeur,
  exercise,
  couleurs = ECRAN_SOMBRE,
  font,
}: {
  largeur: number;
  exercise: Exercise;
  couleurs?: CouleursEcran;
  font: string;
}) {
  const u = largeur / 100;
  const c = couleurs;
  const etapes = exercise.steps.slice(0, 3);

  return (
    <g>
      <rect x={0} y={0} width={largeur} height={largeur * 2.05} fill={c.fond} />

      <BarreEtat u={u} couleur={c.texte} font={font} />

      {/* En-tête du produit */}
      <rect
        x={9 * u}
        y={22 * u}
        width={7 * u}
        height={7 * u}
        rx={2 * u}
        fill={c.accent}
      />
      <text
        x={19 * u}
        y={28 * u}
        fill={c.texte}
        fontFamily={font}
        fontSize={5.2 * u}
        fontWeight={800}
      >
        ATLAS
      </text>
      <rect
        x={72 * u}
        y={21.5 * u}
        width={19 * u}
        height={8 * u}
        rx={4 * u}
        fill={c.accent}
        opacity={0.16}
      />
      <text
        x={81.5 * u}
        y={27 * u}
        fill={c.accent}
        fontFamily={font}
        fontSize={3.8 * u}
        fontWeight={700}
        textAnchor="middle"
      >
        Abonné
      </text>

      {/* Nom de l'exercice */}
      <text
        x={9 * u}
        y={45 * u}
        fill={c.texte}
        fontFamily={font}
        fontSize={8.4 * u}
        fontWeight={800}
      >
        {couper(exercise.name, 17)}
      </text>
      <text
        x={9 * u}
        y={53 * u}
        fill={c.discret}
        fontFamily={font}
        fontSize={4 * u}
        fontWeight={600}
      >
        {exercise.muscles.slice(0, 3).join(" · ")}
      </text>

      {/* Carte du mouvement */}
      <rect
        x={9 * u}
        y={59 * u}
        width={82 * u}
        height={66 * u}
        rx={5 * u}
        fill={c.carte}
      />
      <rect
        x={13 * u}
        y={63 * u}
        width={14 * u}
        height={7 * u}
        rx={3.5 * u}
        fill={c.fond}
        opacity={0.85}
      />
      <text
        x={20 * u}
        y={68 * u}
        fill={c.accent}
        fontFamily={font}
        fontSize={3.8 * u}
        fontWeight={700}
        textAnchor="middle"
      >
        2 / {exercise.steps.length}
      </text>
      <svg
        x={22 * u}
        y={62 * u}
        width={56 * u}
        height={58 * u}
        viewBox="16 10 168 174"
      >
        <FigureBody
          pose={keyPoseOf(exercise)}
          colors={{ stroke: c.trait, strokeDim: c.traitClair, prop: "#2c2825" }}
        />
      </svg>

      {/* Sélecteur de mode, comme dans le produit */}
      <rect
        x={30 * u}
        y={130 * u}
        width={40 * u}
        height={9 * u}
        rx={4.5 * u}
        fill={c.carte}
      />
      <rect
        x={31 * u}
        y={131 * u}
        width={19 * u}
        height={7 * u}
        rx={3.5 * u}
        fill={c.accent}
      />
      <text
        x={40.5 * u}
        y={136 * u}
        fill={c.fond}
        fontFamily={font}
        fontSize={3.6 * u}
        fontWeight={800}
        textAnchor="middle"
      >
        Animer
      </text>
      <text
        x={60 * u}
        y={136 * u}
        fill={c.discret}
        fontFamily={font}
        fontSize={3.6 * u}
        fontWeight={700}
        textAnchor="middle"
      >
        Étapes
      </text>

      {/* Étapes du mouvement */}
      {etapes.map((etape, i) => (
        <g key={i}>
          <rect
            x={9 * u}
            y={(146 + i * 15) * u}
            width={82 * u}
            height={13 * u}
            rx={3 * u}
            fill={i === 1 ? c.carte : "transparent"}
          />
          <text
            x={13 * u}
            y={(151.5 + i * 15) * u}
            fill={i === 1 ? c.accent : c.texte}
            fontFamily={font}
            fontSize={4 * u}
            fontWeight={800}
          >
            {i + 1}. {couper(etape.title, 22)}
          </text>
          <text
            x={13 * u}
            y={(156.5 + i * 15) * u}
            fill={c.discret}
            fontFamily={font}
            fontSize={3.4 * u}
            fontWeight={500}
          >
            {couper(etape.detail, 34)}
          </text>
        </g>
      ))}

      {/* Bouton d'action */}
      <rect
        x={9 * u}
        y={193 * u}
        width={82 * u}
        height={13 * u}
        rx={6.5 * u}
        fill={c.action}
      />
      <text
        x={50 * u}
        y={201.5 * u}
        fill="#ffffff"
        fontFamily={font}
        fontSize={4.4 * u}
        fontWeight={800}
        textAnchor="middle"
      >
        Démarrer la séance
      </text>
    </g>
  );
}

/**
 * La barre d'état du téléphone.
 *
 * Dessinée symbole par symbole, parce que c'est le détail qui décide si la
 * maquette passe pour un vrai téléphone ou pour un dessin : quatre barres de
 * réseau croissantes, les trois arcs du wifi avec son point, et une batterie
 * avec son ergot. Trois rectangles approximatifs ne trompaient personne.
 */
function BarreEtat({
  u,
  couleur,
  font,
}: {
  u: number;
  couleur: string;
  font: string;
}) {
  /** Un arc de wifi : un demi-cercle ouvert vers le bas, centré sur le point. */
  const arc = (r: number) =>
    `M ${(84.6 - r * 0.7071) * u} ${(12.8 - r * 0.7071) * u} A ${r * u} ${r * u} 0 0 1 ${
      (84.6 + r * 0.7071) * u
    } ${(12.8 - r * 0.7071) * u}`;

  return (
    <g>
      <text
        x={9 * u}
        y={13.4 * u}
        fill={couleur}
        fontFamily={font}
        fontSize={4.4 * u}
        fontWeight={700}
        letterSpacing={-0.2 * u}
      >
        9:41
      </text>

      {/* Réseau : quatre barres croissantes */}
      <g fill={couleur}>
        {[1.8, 2.8, 3.8, 4.8].map((hauteur, i) => (
          <rect
            key={i}
            x={(72 + i * 2.2) * u}
            y={(13 - hauteur) * u}
            width={1.5 * u}
            height={hauteur * u}
            rx={0.5 * u}
          />
        ))}
      </g>

      {/* Wifi : trois arcs et un point */}
      <g
        stroke={couleur}
        strokeWidth={1.1 * u}
        fill="none"
        strokeLinecap="round"
      >
        <path d={arc(4.6)} />
        <path d={arc(3)} />
      </g>
      <circle cx={84.6 * u} cy={12.4 * u} r={0.85 * u} fill={couleur} />

      {/* Batterie : contour, charge et ergot */}
      <rect
        x={90 * u}
        y={8.8 * u}
        width={7.2 * u}
        height={4.2 * u}
        rx={1.3 * u}
        fill="none"
        stroke={couleur}
        strokeWidth={0.6 * u}
        opacity={0.45}
      />
      <rect
        x={90.8 * u}
        y={9.6 * u}
        width={4.6 * u}
        height={2.6 * u}
        rx={0.8 * u}
        fill={couleur}
      />
      <path
        d={`M ${98.1 * u} ${10.2 * u} A ${0.8 * u} ${0.8 * u} 0 0 1 ${98.1 * u} ${11.6 * u}`}
        stroke={couleur}
        strokeWidth={0.6 * u}
        fill="none"
        opacity={0.45}
      />
    </g>
  );
}

function couper(texte: string, max: number) {
  return texte.length > max ? `${texte.slice(0, max - 1).trimEnd()}…` : texte;
}
