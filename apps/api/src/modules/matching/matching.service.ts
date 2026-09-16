import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RawReportInput, ExtractedEventResult, MatchResult, ActivityContext } from './matching.types';
import { EventExtractorService } from './extraction/event-extractor.service';
import { CandidateRetrievalService } from './retrieval/candidate-retrieval.service';
import { HybridMatchingService } from './scoring/hybrid-matching.service';
import { BenchmarkRunnerService } from './benchmark/benchmark-runner.service';
import { MatchDecision } from '@sitesync/types';

export class MatchingService {
  private eventExtractor = new EventExtractorService();
  private retrievalService = new CandidateRetrievalService();
  private hybridMatcher = new HybridMatchingService();
  private benchmarkRunner = new BenchmarkRunnerService();
  private prisma: any;

  constructor(prismaClient?: any) {
    this.prisma = prismaClient || PrismaService.getInstance();
  }

  /**
   * Extracts structured events from raw field report input.
   */
  public extractEvents(report: RawReportInput): ExtractedEventResult[] {
    return this.eventExtractor.extractEventsFromReport(report);
  }

  /**
   * Matches a single extracted event against project activities.
   */
  public async matchSingleEvent(projectId: string, event: ExtractedEventResult): Promise<MatchResult> {
    const activities = await this.getProjectActivityContext(projectId);
    const { candidates, eventEmbedding } = this.retrievalService.retrieveCandidates(event, activities, 10);
    return this.hybridMatcher.matchEvent(event, candidates, eventEmbedding);
  }

  /**
   * Runs batch matching on all extracted events for a project and persists decisions in PostgreSQL.
   */
  public async runBatchMatching(projectId: string): Promise<{ matchedCount: number; results: MatchResult[] }> {
    const activities = await this.getProjectActivityContext(projectId);

    // Fetch unlinked events from database
    const dbEvents = await this.prisma.extractedEvent.findMany({
      where: {
        fieldReport: { projectId },
        activityMatch: null,
      },
      include: {
        fieldReport: true,
      },
    });

    const results: MatchResult[] = [];

    for (const dbEvt of dbEvents) {
      const event: ExtractedEventResult = {
        id: dbEvt.id,
        reportId: dbEvt.fieldReportId,
        description: dbEvt.description,
        normalizedDescription: dbEvt.normalizedDescription,
        eventDate: dbEvt.eventDate.toISOString(),
        discipline: dbEvt.discipline,
        location: dbEvt.location || 'Compressor Area',
        progress: dbEvt.progress || 0.0,
        status: dbEvt.status,
        entities: [],
        sourceText: dbEvt.sourceText,
        sourcePage: dbEvt.sourcePage,
        extractionConfidence: dbEvt.extractionConfidence,
      };

      const { candidates, eventEmbedding } = this.retrievalService.retrieveCandidates(event, activities, 10);
      const matchResult = this.hybridMatcher.matchEvent(event, candidates, eventEmbedding);
      results.push(matchResult);

      if (matchResult.topCandidate) {
        // Persist ActivityMatch
        await this.prisma.activityMatch.upsert({
          where: { eventId: dbEvt.id },
          update: {
            activityId: matchResult.topCandidate.activityId,
            rank: 1,
            semanticScore: matchResult.topCandidate.scores.semantic,
            disciplineScore: matchResult.topCandidate.scores.discipline,
            locationScore: matchResult.topCandidate.scores.location,
            wbsScore: matchResult.topCandidate.scores.wbs,
            temporalScore: matchResult.topCandidate.scores.temporal,
            dependencyScore: matchResult.topCandidate.scores.dependency,
            entityScore: matchResult.topCandidate.scores.entity,
            finalScore: matchResult.topCandidate.finalScore,
            confidence: matchResult.confidence,
            decision: matchResult.decision,
            decisionReason: matchResult.explanation,
          },
          create: {
            eventId: dbEvt.id,
            activityId: matchResult.topCandidate.activityId,
            rank: 1,
            semanticScore: matchResult.topCandidate.scores.semantic,
            disciplineScore: matchResult.topCandidate.scores.discipline,
            locationScore: matchResult.topCandidate.scores.location,
            wbsScore: matchResult.topCandidate.scores.wbs,
            temporalScore: matchResult.topCandidate.scores.temporal,
            dependencyScore: matchResult.topCandidate.scores.dependency,
            entityScore: matchResult.topCandidate.scores.entity,
            finalScore: matchResult.topCandidate.finalScore,
            confidence: matchResult.confidence,
            decision: matchResult.decision,
            decisionReason: matchResult.explanation,
          },
        });
      }
    }

    return {
      matchedCount: results.length,
      results,
    };
  }

  /**
   * Retrieves match results and candidate rankings for a project.
   */
  public async getMatchingResults(projectId: string) {
    return this.prisma.activityMatch.findMany({
      where: {
        event: { fieldReport: { projectId } },
      },
      include: {
        event: true,
        activity: true,
      },
    });
  }

  /**
   * Runs the offline benchmark evaluation on the held-out test split.
   */
  public async runBenchmark() {
    return this.benchmarkRunner.runBenchmark();
  }

  private async getProjectActivityContext(projectId: string): Promise<ActivityContext[]> {
    const dbActivities = await this.prisma.activity.findMany({
      where: { projectId },
      include: {
        wbsNode: true,
      },
    });

    return dbActivities.map((a: any) => ({
      id: a.id,
      activityCode: a.activityCode,
      name: a.name,
      description: a.description,
      discipline: a.discipline,
      activityType: a.activityType || 'WORK',
      location: a.location,
      wbsPath: a.wbsPath,
      plannedStart: a.plannedStart.toISOString(),
      plannedFinish: a.plannedFinish.toISOString(),
      plannedProgress: a.plannedProgress,
      actualProgress: a.actualProgress,
      status: a.status,
    }));
  }
}
