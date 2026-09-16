import { CopilotService } from './copilot.service';
import { IntentClassifierService } from './intent-classifier.service';
import { DeterministicAnalyticsService } from './deterministic-analytics.service';
import { RetrievalOrchestratorService } from './retrieval-orchestrator.service';
import { ContextAssemblerService } from './context-assembler.service';
import { GroundingValidatorService } from './grounding-validator.service';
import { CopilotConversationService } from './copilot-conversation.service';

export * from './copilot.config';
export * from './intent-classifier.service';
export * from './deterministic-analytics.service';
export * from './retrieval-orchestrator.service';
export * from './context-assembler.service';
export * from './grounding-validator.service';
export * from './copilot-conversation.service';
export * from './copilot.service';

// Module Singletons
export const intentClassifierService = new IntentClassifierService();
export const deterministicAnalyticsService = new DeterministicAnalyticsService();
export const retrievalOrchestratorService = new RetrievalOrchestratorService();
export const contextAssemblerService = new ContextAssemblerService();
export const groundingValidatorService = new GroundingValidatorService();
export const copilotConversationService = new CopilotConversationService();

export const copilotService = new CopilotService(
  intentClassifierService,
  deterministicAnalyticsService,
  retrievalOrchestratorService,
  contextAssemblerService,
  groundingValidatorService,
  copilotConversationService
);
