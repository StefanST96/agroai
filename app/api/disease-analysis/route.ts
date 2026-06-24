import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/db";

type AnalysisTemplate = {
  suspectedIssue: string;
  confidence: number;
  symptoms: string[];
  recommendation: string;
  severity: string;
};

const templates: Record<string, AnalysisTemplate> = {
  malina: {
    suspectedIssue: "Rani simptomi plamenjace lista",
    confidence: 82,
    symptoms: ["tamne fleke na ivicama lista", "vlazni uslovi posle kise", "blago zutilo oko pega"],
    recommendation:
      "Ukloni zarazene listove, popravi provetravanje i uradi preventivni tretman registrovanim preparatom kada nema direktnog sunca.",
    severity: "Srednji rizik",
  },
  paradajz: {
    suspectedIssue: "Moguca plamenjaca paradajza",
    confidence: 76,
    symptoms: ["braon pege", "vlazni listovi", "brzo sirenje posle padavina"],
    recommendation:
      "Odmah ukloni zahvacene listove, smanji zalivanje preko lista i proveri preporuceni fungicid za fazu razvoja.",
    severity: "Visok rizik",
  },
  psenica: {
    suspectedIssue: "Stres useva usled nedostatka azota",
    confidence: 71,
    symptoms: ["blede lisne plojke", "sporiji porast", "nejednak razvoj klasa"],
    recommendation: "Uraditi prihranu prema analizi zemljista i proveriti vlagu na parceli.",
    severity: "Srednji rizik",
  },
  kukuruz: {
    suspectedIssue: "Moguca pojava pegavosti lista",
    confidence: 69,
    symptoms: ["duguljaste pege", "susenje rubova", "neravnomerna boja lista"],
    recommendation: "Pratiti sirenje simptoma i uraditi tretman registrovanim sredstvom po preporuci agronoma.",
    severity: "Srednji rizik",
  },
  jabuka: {
    suspectedIssue: "Pocetni simptomi cadjave krastavosti",
    confidence: 74,
    symptoms: ["maslinaste pege", "hrapava povrsina lista", "pojava na mladim listovima"],
    recommendation: "Ukloniti zahvacene listove i primeniti preventivni tretman prema fenofazi.",
    severity: "Srednji rizik",
  },
};

export async function POST(request: Request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: "No current user." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const cropRaw = typeof body.crop === "string" ? body.crop : "";
  const notes = typeof body.notes === "string" ? body.notes : "";
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl : "";
  const imageAssetId = typeof body.imageAssetId === "number" ? body.imageAssetId : null;

  if (!cropRaw || (!imageAssetId && !imageUrl)) {
    return NextResponse.json({ error: "Crop and image are required." }, { status: 400 });
  }

  const template = templates[cropRaw.toLowerCase()] ?? templates.malina;

  const upload = await prisma.plantImageUpload.create({
    data: {
      userId: currentUser.id,
      imageUrl: imageUrl || (imageAssetId ? `/api/media/${imageAssetId}` : null),
      imageAssetId,
      crop: cropRaw,
      notes,
    },
  });

  const analysis = await prisma.diseaseAnalysis.create({
    data: {
      userId: currentUser.id,
      uploadId: upload.id,
      crop: cropRaw,
      suspectedIssue: template.suspectedIssue,
      confidence: template.confidence,
      symptoms: template.symptoms,
      recommendation: template.recommendation,
      severity: template.severity,
    },
  });

  return NextResponse.json({
    id: analysis.id,
    crop: analysis.crop,
    suspectedIssue: analysis.suspectedIssue,
    confidence: analysis.confidence,
    symptoms: analysis.symptoms,
    recommendation: analysis.recommendation,
    severity: analysis.severity,
  });
}
