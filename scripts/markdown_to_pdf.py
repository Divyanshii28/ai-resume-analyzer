import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


def inline_markdown(text):
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    parts = text.split("`")
    for index in range(1, len(parts), 2):
        parts[index] = f'<font name="Courier" backColor="#f2f2f2">{parts[index]}</font>'
    return "".join(parts)


def build_pdf(markdown_path, pdf_path):
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="DocTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=28,
            textColor=colors.HexColor("#111827"),
            spaceAfter=18,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SectionHeading",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#111827"),
            spaceBefore=14,
            spaceAfter=7,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SubHeading",
            parent=styles["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#374151"),
            spaceBefore=10,
            spaceAfter=5,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Body",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#1f2937"),
            spaceAfter=7,
        )
    )
    styles.add(
        ParagraphStyle(
            name="DocBullet",
            parent=styles["Body"],
            leftIndent=18,
            firstLineIndent=-10,
            bulletIndent=6,
            spaceAfter=5,
        )
    )

    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=LETTER,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
        title=markdown_path.stem,
        author="Resume Analyser",
    )

    story = []
    for raw_line in markdown_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line:
            story.append(Spacer(1, 4))
            continue

        if line.startswith("# "):
            story.append(Paragraph(inline_markdown(line[2:]), styles["DocTitle"]))
        elif line.startswith("## "):
            story.append(Paragraph(inline_markdown(line[3:]), styles["SectionHeading"]))
        elif line.startswith("### "):
            story.append(Paragraph(inline_markdown(line[4:]), styles["SubHeading"]))
        elif line.startswith("- "):
            story.append(Paragraph(inline_markdown(line[2:]), styles["DocBullet"], bulletText="•"))
        else:
            story.append(Paragraph(inline_markdown(line), styles["Body"]))

    doc.build(story)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python markdown_to_pdf.py input.md output.pdf")

    build_pdf(Path(sys.argv[1]), Path(sys.argv[2]))
