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
  children,
}: {
  x: number;
  y: number;
  largeur: number;
  /** Identifiant unique : plusieurs téléphones cohabitent sur une même page. */
  uid: string;
  children: React.ReactNode;
}) {
  const hauteur = largeur * 2.05;
  const rayon = largeur * 0.115;
  const bord = largeur * 0.022;

  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id={`ecran-${uid}`}>
          <rect x={0} y={0} width={largeur} height={hauteur} rx={rayon} />
        </clipPath>
        <linearGradient id={`chassis-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4a443e" />
          <stop offset="45%" stopColor="#1e1b19" />
          <stop offset="100%" stopColor="#4a443e" />
        </linearGradient>
      </defs>

      <rect
        x={-bord}
        y={-bord}
        width={largeur + bord * 2}
        height={hauteur + bord * 2}
        rx={rayon + bord}
        fill={`url(#chassis-${uid})`}
      />
      <rect x={0} y={0} width={largeur} height={hauteur} rx={rayon} fill="#0a0908" />

      <g clipPath={`url(#ecran-${uid})`}>{children}</g>

      {/* Îlot dynamique : c'est lui qui fait lire « téléphone » au premier coup d'œil. */}
      <rect
        x={largeur * 0.34}
        y={largeur * 0.035}
        width={largeur * 0.32}
        height={largeur * 0.075}
        rx={largeur * 0.038}
        fill="#0a0908"
      />
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

      {/* Barre d'état */}
      <text x={9 * u} y={13 * u} fill={c.texte} fontFamily={font} fontSize={4.2 * u} fontWeight={700}>
        9:41
      </text>
      <g fill={c.texte} opacity={0.9}>
        <rect x={78 * u} y={9.6 * u} width={2 * u} height={3.4 * u} rx={0.5 * u} />
        <rect x={81 * u} y={8.6 * u} width={2 * u} height={4.4 * u} rx={0.5 * u} />
        <rect x={84 * u} y={7.6 * u} width={2 * u} height={5.4 * u} rx={0.5 * u} />
        <rect x={88 * u} y={8.4 * u} width={7 * u} height={4.6 * u} rx={1.4 * u} />
      </g>

      {/* En-tête du produit */}
      <rect x={9 * u} y={22 * u} width={7 * u} height={7 * u} rx={2 * u} fill={c.accent} />
      <text x={19 * u} y={28 * u} fill={c.texte} fontFamily={font} fontSize={5.2 * u} fontWeight={800}>
        ATLAS
      </text>
      <rect x={72 * u} y={21.5 * u} width={19 * u} height={8 * u} rx={4 * u} fill={c.accent} opacity={0.16} />
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
      <text x={9 * u} y={45 * u} fill={c.texte} fontFamily={font} fontSize={8.4 * u} fontWeight={800}>
        {couper(exercise.name, 17)}
      </text>
      <text x={9 * u} y={53 * u} fill={c.discret} fontFamily={font} fontSize={4 * u} fontWeight={600}>
        {exercise.muscles.slice(0, 3).join(" · ")}
      </text>

      {/* Carte du mouvement */}
      <rect x={9 * u} y={59 * u} width={82 * u} height={66 * u} rx={5 * u} fill={c.carte} />
      <rect x={13 * u} y={63 * u} width={14 * u} height={7 * u} rx={3.5 * u} fill={c.fond} opacity={0.85} />
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
      <svg x={22 * u} y={62 * u} width={56 * u} height={58 * u} viewBox="16 10 168 174">
        <FigureBody
          pose={keyPoseOf(exercise)}
          colors={{ stroke: c.trait, strokeDim: c.traitClair, prop: "#2c2825" }}
        />
      </svg>

      {/* Sélecteur de mode, comme dans le produit */}
      <rect x={30 * u} y={130 * u} width={40 * u} height={9 * u} rx={4.5 * u} fill={c.carte} />
      <rect x={31 * u} y={131 * u} width={19 * u} height={7 * u} rx={3.5 * u} fill={c.accent} />
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
      <rect x={9 * u} y={193 * u} width={82 * u} height={13 * u} rx={6.5 * u} fill={c.action} />
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

function couper(texte: string, max: number) {
  return texte.length > max ? `${texte.slice(0, max - 1).trimEnd()}…` : texte;
}
