import fs from 'node:fs/promises';
import path from 'node:path';

import {
  learningCenterCatalogDefinition,
  type LearningCenterCatalogDefinition,
  type LearningCenterDocSection,
  type LearningCenterGuide,
  type LearningCenterQuickQuestion,
  type LearningCenterTourStep,
} from './learning-center-catalog';

export type LearningCenterGuideWithContent = LearningCenterGuide & {
  content: string;
};

export type LearningCenterDocSectionWithContent = LearningCenterDocSection & {
  content: string;
};

export type LearningCenterCatalog = {
  hero: LearningCenterCatalogDefinition['hero'];
  tourSteps: LearningCenterTourStep[];
  guides: LearningCenterGuideWithContent[];
  faq: LearningCenterDocSectionWithContent;
  glossary: LearningCenterDocSectionWithContent;
  news: LearningCenterDocSectionWithContent;
  assistant: LearningCenterCatalogDefinition['assistant'];
};

const docsRoot = path.resolve(process.cwd(), '..', 'docs');

async function readLearningCenterDoc(relativePath: string): Promise<string> {
  const absolutePath = path.join(docsRoot, relativePath);
  return fs.readFile(absolutePath, 'utf8');
}

async function readSection(section: LearningCenterDocSection): Promise<LearningCenterDocSectionWithContent> {
  return {
    ...section,
    content: await readLearningCenterDoc(section.docPath),
  };
}

async function readGuide(guide: LearningCenterGuide): Promise<LearningCenterGuideWithContent> {
  return {
    ...guide,
    content: await readLearningCenterDoc(guide.docPath),
  };
}

export async function getLearningCenterCatalog(): Promise<LearningCenterCatalog> {
  const [guides, faq, glossary, news] = await Promise.all([
    Promise.all(learningCenterCatalogDefinition.guides.map(readGuide)),
    readSection(learningCenterCatalogDefinition.faq),
    readSection(learningCenterCatalogDefinition.glossary),
    readSection(learningCenterCatalogDefinition.news),
  ]);

  return {
    hero: learningCenterCatalogDefinition.hero,
    tourSteps: learningCenterCatalogDefinition.tourSteps,
    guides,
    faq,
    glossary,
    news,
    assistant: learningCenterCatalogDefinition.assistant,
  };
}

export function getLearningCenterGuideBySlug(
  catalog: LearningCenterCatalog,
  slug: string,
): LearningCenterGuideWithContent | undefined {
  return catalog.guides.find((guide) => guide.slug === slug);
}

export function getLearningCenterQuickQuestion(
  catalog: LearningCenterCatalog,
  id: string,
): LearningCenterQuickQuestion | undefined {
  return catalog.assistant.quickQuestions.find((question) => question.id === id);
}
