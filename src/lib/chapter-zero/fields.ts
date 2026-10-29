export const sections = [
  { title: 'Toi', fields: [
    { key: 'name', label: 'Prénom ou surnom', required: true },
    { key: 'presence', label: 'Présence', options: ['Oui, je suis là', 'Je confirme bientôt'], required: true },
    { key: 'color', label: 'Couleur préférée', type: 'color' },
    { key: 'shoe', label: 'Pointure' },
  ] },
  { title: 'À table', fields: [
    { key: 'allergies', label: 'Allergies ou intolérances' },
    { key: 'diet', label: 'Régime alimentaire' },
    { key: 'breakfast', label: 'Petit-déjeuner', options: ['Salé', 'Sucré', 'Les deux'] },
    { key: 'drink', label: 'Ta boisson du matin', options: ['Café', 'Thé', 'Jus'] },
    { key: 'flavor', label: 'Un plat ou une saveur préférée' },
  ] },
  { title: 'Sport', fields: [
    { key: 'padel', label: 'Niveau de padel', options: ['Jamais joué', 'Débutant', 'Intermédiaire', 'Confirmé'] },
    { key: 'run', label: 'Allure de course', options: ['Marche active', '+ de 6:30 /km', '5:30–6:30 /km', '- de 5:30 /km'] },
    { key: 'injury', label: 'Blessure ou contrainte physique' },
  ] },
  { title: 'Les astres', fields: [
    { key: 'birthdate', label: 'Date de naissance', type: 'date' },
    { key: 'birthtime', label: 'Heure de naissance (facultatif)', type: 'time', note: 'Un petit message à tes parents ?' },
    { key: 'birthcity', label: 'Ville de naissance' },
  ] },
  { title: 'Logistique', fields: [
    { key: 'arrival', label: "Heure d’arrivée", type: 'time' },
    { key: 'departure', label: 'Heure de départ', type: 'time' },
    { key: 'roommate', label: 'Avec qui aimerais-tu partager ta chambre ?' },
    { key: 'emergency', label: 'Contact en cas d’urgence (nom et téléphone)' },
  ] },
  { title: 'Ambiance', fields: [
    { key: 'photos', label: 'Apparaître dans les photos et vidéos partagées publiquement', options: ['Oui', 'Seulement entre nous'], required: true },
    { key: 'song', label: 'Une chanson pour la playlist' },
    { key: 'word', label: 'En un mot, ce que tu attends du week-end' },
  ] },
] satisfies { title: string; fields: {key: string; label: string; type?: string; required?: boolean; options?: string[]; note?: string}[] }[];
export type Answers = Record<string, string>;
export function summary(a: Answers) {
  return 'THE HOUSE — Chapter 0\n\n' + sections.map(s => s.title + '\n' + s.fields.map(f => `${f.label} : ${a[f.key] || '—'}`).join('\n')).join('\n\n');
}
export function zodiac(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
  const [, m, d] = value.split('-').map(Number);
  const ends = [19,18,20,19,20,20,22,22,22,22,21,21];
  const signs = ['Capricorne','Verseau','Poissons','Bélier','Taureau','Gémeaux','Cancer','Lion','Vierge','Balance','Scorpion','Sagittaire','Capricorne'];
  return m >= 1 && m <= 12 && d >= 1 && d <= 31 ? signs[m - (d <= ends[m-1] ? 1 : 0)] : '';
}
