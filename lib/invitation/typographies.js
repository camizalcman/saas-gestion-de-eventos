export const INVITATION_TYPOGRAPHIES = [
  {
    id: "elegante",
    name: "Elegante",
    headingFont: "var(--font-playfair)",
    bodyFont: "var(--font-lora)",
  },
  {
    id: "moderna",
    name: "Moderna",
    headingFont: "var(--font-montserrat)",
    bodyFont: "var(--font-nunito-sans)",
  },
  {
    id: "romantica",
    name: "Romántica",
    headingFont: "var(--font-dancing-script)",
    bodyFont: "var(--font-literata)",
  },
];

export function getTypography(id) {
  return INVITATION_TYPOGRAPHIES.find((t) => t.id === id) || INVITATION_TYPOGRAPHIES[0];
}