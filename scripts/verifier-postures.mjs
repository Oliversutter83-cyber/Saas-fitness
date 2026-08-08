#!/usr/bin/env node
/**
 * Contrôle des postures dessinées.
 *
 * Ces vérifications sont nées de défauts trouvés un par un, et signalés par
 * l'exploitant du site en regardant les animations : un bras tendu plus court
 * qu'un bras au repos, un squat qui ne descendait pas à la profondeur annoncée
 * par sa propre consigne, un avant-bras qui traversait la chaise. Aucun n'aurait
 * été détecté par une compilation ou un test d'affichage — ce sont des erreurs
 * de dessin, pas de code.
 *
 * Le fichier lit les coordonnées directement dans la source plutôt que
 * d'importer le module : ça évite d'avoir à compiler du TypeScript pour un
 * contrôle qui ne regarde que des nombres.
 *
 *   node scripts/verifier-postures.mjs
 */

import { readFileSync } from "node:fs";

const SOURCE = "src/content/poses.ts";
const GROUND_Y = 178;

/** Longueurs de référence, mesurées sur la posture debout. */
const CIBLES = { bras: 54, jambe: 74, tronc: 50 };
/** Un membre peut légitimement paraître plus court vu en raccourci. */
const TOLERANCE_LONGUEUR = 0.35;

const src = readFileSync(new URL(`../${SOURCE}`, import.meta.url), "utf8");
const nb = (s) => s.split(",").map(Number);
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

const postures = [];
for (const [, nom, corps] of src.matchAll(/^ {2}([a-zA-Z]+): \{\n([\s\S]*?)^ {2}\},$/gm)) {
  const point = (k) => {
    const m = corps.match(new RegExp(`${k}: \\[([-\\d, ]+)\\]`));
    return m ? nb(m[1]) : null;
  };
  const paire = (k) => {
    const m = corps.match(new RegExp(`${k}: \\[\\[([-\\d, ]+)\\], \\[([-\\d, ]+)\\]\\]`));
    return m ? [nb(m[1]), nb(m[2])] : null;
  };
  const head = point("head");
  if (!head) continue;
  const boite = corps.match(/kind: "box", x: (\d+), y: (\d+), w: (\d+), h: (\d+)/);
  postures.push({
    nom,
    head,
    neck: point("neck"),
    hip: point("hip"),
    armA: paire("armA"),
    armB: paire("armB"),
    legA: paire("legA"),
    legB: paire("legB"),
    boite: boite && { x: +boite[1], y: +boite[2], w: +boite[3], h: +boite[4] },
  });
}

const alertes = [];
const signaler = (posture, message) => alertes.push(`${posture.padEnd(22)} ${message}`);

for (const p of postures) {
  // 1. Un membre ne doit pas changer de longueur d'une posture à l'autre : sinon
  //    l'animation l'étire comme un élastique. On tolère le raccourci de
  //    perspective, pas l'allongement.
  for (const [cle, cible, nom] of [
    ["armA", CIBLES.bras, "bras proche"],
    ["armB", CIBLES.bras, "bras opposé"],
    ["legA", CIBLES.jambe, "jambe proche"],
    ["legB", CIBLES.jambe, "jambe opposée"],
  ]) {
    const membre = p[cle];
    if (!membre) continue;
    const racine = cle.startsWith("arm") ? p.neck : p.hip;
    const longueur = dist(racine, membre[0]) + dist(membre[0], membre[1]);
    if (longueur > cible * (1 + TOLERANCE_LONGUEUR)) {
      signaler(p.nom, `${nom} trop long : ${Math.round(longueur)} pour ${cible} attendus`);
    }
  }

  const tronc = dist(p.neck, p.hip);
  if (Math.abs(tronc - CIBLES.tronc) > CIBLES.tronc * 0.3) {
    signaler(p.nom, `tronc de ${Math.round(tronc)} au lieu de ${CIBLES.tronc}`);
  }

  // 2. Aucune articulation ne doit se trouver à l'intérieur d'une chaise.
  if (p.boite) {
    const b = p.boite;
    const dedans = (pt) =>
      pt[0] > b.x + 3 && pt[0] < b.x + b.w - 3 && pt[1] > b.y + 3 && pt[1] < b.y + b.h - 3;
    for (const [cle, pt] of [
      ["coude proche", p.armA[0]], ["main proche", p.armA[1]],
      ["coude opposé", p.armB[0]], ["main opposée", p.armB[1]],
      ["genou proche", p.legA[0]], ["genou opposé", p.legB[0]],
      ["bassin", p.hip], ["tête", p.head],
    ]) {
      if (dedans(pt)) signaler(p.nom, `${cle} enfoncé dans l'appui`);
    }
  }

  // 3. La silhouette doit tenir dans le cadre visible, pointes de pieds
  //    comprises : le pied en l'air prolonge le tibia de la moitié de sa longueur.
  const pointes = [p.legA, p.legB].map(([genou, cheville]) => {
    const auSol = cheville[1] > GROUND_Y - 14;
    return auSol
      ? [cheville[0] + 11, cheville[1]]
      : [
          cheville[0] + (cheville[0] - genou[0]) * 0.5,
          cheville[1] + (cheville[1] - genou[1]) * 0.5,
        ];
  });
  const tous = [p.head, p.neck, p.hip, ...p.armA, ...p.armB, ...p.legA, ...p.legB, ...pointes];
  for (const pt of tous) {
    if (pt[0] < 20 || pt[0] > 181) signaler(p.nom, `sort du cadre en largeur (x = ${Math.round(pt[0])})`);
    if (pt[1] < 14 || pt[1] > GROUND_Y + 2) signaler(p.nom, `sort du cadre en hauteur (y = ${Math.round(pt[1])})`);
  }
}

console.log(`${postures.length} postures contrôlées.`);
if (alertes.length === 0) {
  console.log("Aucun défaut.");
} else {
  console.log(`\n${alertes.length} point(s) à regarder :\n`);
  for (const a of alertes) console.log("  " + a);
  process.exitCode = 1;
}
