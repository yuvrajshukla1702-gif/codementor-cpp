from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.colors import black, HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, HRFlowable, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

pdfmetrics.registerFont(TTFont("Arial", r"C:\Windows\Fonts\arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", r"C:\Windows\Fonts\arialbd.ttf"))

OUT = Path(r"C:\Users\yuvra\Downloads\Yuvraj_Shukla_Resume.pdf")
LINE = HexColor("#333333")


def build(path: Path):
    doc = SimpleDocTemplate(
        str(path),
        pagesize=A4,
        leftMargin=0.55 * inch,
        rightMargin=0.55 * inch,
        topMargin=0.4 * inch,
        bottomMargin=0.4 * inch,
    )
    styles = getSampleStyleSheet()
    name = ParagraphStyle("Name", parent=styles["Normal"], fontName="Arial-Bold", fontSize=16, alignment=TA_CENTER, spaceAfter=4)
    contact = ParagraphStyle("Contact", parent=styles["Normal"], fontName="Arial", fontSize=8.5, alignment=TA_CENTER, textColor=LINE, spaceAfter=8)
    h = ParagraphStyle("H", parent=styles["Normal"], fontName="Arial-Bold", fontSize=11, spaceBefore=6, spaceAfter=3, textColor=black)
    body = ParagraphStyle("B", parent=styles["Normal"], fontName="Arial", fontSize=9, leading=11.5, alignment=TA_JUSTIFY, spaceAfter=2)
    bullet = ParagraphStyle("Bu", parent=styles["Normal"], fontName="Arial", fontSize=9, leading=11.5, leftIndent=10, spaceAfter=1)

    story = []
    story.append(Paragraph("YUVRAJ SHUKLA", name))
    story.append(
        Paragraph(
            "Phone: +91 9793625079 | Email: yuvrajshukla1702@gmail.com<br/>"
            "GitHub: github.com/yuvrajshukla1702-gif | LinkedIn: linkedin.com/in/yuvraj-shukla-57131b328 | Greater Noida, UP",
            contact,
        )
    )
    story.append(HRFlowable(width="100%", thickness=1, color=LINE, spaceAfter=6))

    story.append(Paragraph("PROFESSIONAL SUMMARY", h))
    story.append(
        Paragraph(
            "B.Tech CSE (Artificial Intelligence) student at GNIOT seeking a software/web development internship. "
            "Web Development Intern at Digital Dost (HTML, CSS, JavaScript). Building <b>CodeMentor C++</b>, a full-stack DSA prep app "
            "with Next.js, TypeScript, React, Tailwind, Prisma, Monaco, local g++ judge, and Hinglish TTS lessons. "
            "Skilled in C++, JavaScript/TypeScript, React, Tailwind, Node.js, Git.",
            body,
        )
    )

    story.append(Paragraph("EDUCATION", h))
    story.append(
        Paragraph(
            "<b>B.Tech in Computer Science and Engineering (Artificial Intelligence)</b> | Aug 2024 – Present<br/>"
            "Greater Noida Institute of Technology (GNIOT), Affiliated with AKTU | CGPA: 6.4/10 | 3rd Year (5th Semester)",
            body,
        )
    )
    story.append(
        Paragraph(
            "<b>Higher Secondary (Class 12 / 10+2)</b> | CBSE Board | 70% | 2023 – 2024 | Rani Laxmi Bai Memorial School, Lucknow",
            body,
        )
    )

    story.append(Paragraph("TECHNICAL SKILLS", h))
    story.append(
        Paragraph(
            "<b>Languages:</b> C++, Python, JavaScript, TypeScript<br/>"
            "<b>Frontend:</b> HTML, CSS, Tailwind CSS, React, Next.js<br/>"
            "<b>Backend / Tools:</b> Node.js, Prisma, SQLite, Git, VS Code, Cursor",
            body,
        )
    )

    story.append(Paragraph("PROJECTS", h))
    story.append(
        Paragraph(
            "<b>CodeMentor C++</b> | Next.js, TypeScript, React, Tailwind, Prisma, Monaco<br/>"
            "Personal DSA practice platform: local C++ judge (g++), Easy/Medium/Best solutions, Hinglish course lessons with TTS, "
            "Code walk, LeetCode sync/submit, and a Today learning path with streaks.",
            body,
        )
    )
    story.append(
        Paragraph(
            "<b>Digital Dost Marketing Website</b> | HTML, CSS, JavaScript | github.com/yuvrajshukla1702-gif/digital-dost-website<br/>"
            "Responsive multi-page marketing site (Home, About, Services, Blog, Contact) with SEO basics and interactive blog comments.",
            body,
        )
    )
    story.append(
        Paragraph(
            "<b>Logistics Tracking Dashboard</b> | React, Tailwind CSS, Node.js | github.com/yuvrajshukla1702-gif/logistics<br/>"
            "Responsive tracking UI with live simulation mode; Node.js backend setup for full-stack practice.",
            body,
        )
    )

    story.append(Paragraph("INTERNSHIP / TRAINING", h))
    story.append(
        Paragraph(
            "<b>Web Development Intern</b> | Digital Dost | Remote | Jun 2026 – Present<br/>"
            "Developing and maintaining the marketing website with HTML, CSS, and JavaScript; responsive pages and SEO basics.",
            body,
        )
    )
    story.append(Paragraph("<b>C and C++ Programming Training</b> | 6 Months — fundamentals, logic building, problem-solving.", body))

    story.append(Paragraph("CERTIFICATIONS", h))
    story.append(Paragraph("• Ultimate Web Development Course 2026 – Build Modern Websites | Udemy (Haris Ali Khan)", bullet))
    story.append(Paragraph("• C and C++ Programming Training Certificate | 6-Month Training Program", bullet))

    story.append(Paragraph("ACHIEVEMENTS", h))
    story.append(Paragraph("• Web Development Intern at Digital Dost on live website development.", bullet))
    story.append(Paragraph("• Built CodeMentor C++ and published frontend projects on GitHub.", bullet))

    story.append(Paragraph("SOFT SKILLS", h))
    story.append(Paragraph("Teamwork | Problem Solving | Communication | Time Management", body))

    doc.build(story)
    print("Wrote", path)


build(OUT)
build(Path(r"C:\Users\yuvra\.cursor\resume and everything\Yuvraj_Shukla_Resume.pdf"))
