import { ExamRuleSet, ExamErrorEvent, ExamResultStatus } from '../types';

export interface EvaluationSummary {
  result: ExamResultStatus;
  lightErrorCount: number;
  seriousErrorCount: number;
  disqualifyingErrorCount: number;
  failureReasonsKa: string[];
}

/**
 * RulesEngine - Evaluates error counts against configurable RuleSet thresholds
 */
export function evaluateExamResult(
  errorEvents: ExamErrorEvent[],
  ruleSet: ExamRuleSet
): EvaluationSummary {
  const activeErrors = errorEvents.filter((e) => !e.isUndone);

  const lightErrorCount = activeErrors.filter((e) => e.severity === 'LIGHT').length;
  const seriousErrorCount = activeErrors.filter((e) => e.severity === 'SERIOUS').length;
  const disqualifyingErrorCount = activeErrors.filter((e) => e.severity === 'DISQUALIFYING').length;

  const failureReasonsKa: string[] = [];
  let isFail = false;

  if (disqualifyingErrorCount >= ruleSet.disqualificationFailThreshold) {
    isFail = true;
    failureReasonsKa.push(
      `დაფიქსირდა ${disqualifyingErrorCount} დისკვალიფიკაციის გამომწვევი უსაფრთხოების დარღვევა`
    );
  }

  if (seriousErrorCount >= ruleSet.seriousErrorFailThreshold) {
    isFail = true;
    failureReasonsKa.push(
      `დაფიქსირდა ${seriousErrorCount} სერიოზული შეცდომა (ზღვარი: ${ruleSet.seriousErrorFailThreshold})`
    );
  }

  if (lightErrorCount >= ruleSet.lightErrorFailThreshold) {
    isFail = true;
    failureReasonsKa.push(
      `გადააჭარბეთ მსუბუქი შეცდომების ზღვარს: ${lightErrorCount}/${ruleSet.lightErrorFailThreshold}`
    );
  }

  return {
    result: isFail ? 'FAIL' : 'PASS',
    lightErrorCount,
    seriousErrorCount,
    disqualifyingErrorCount,
    failureReasonsKa,
  };
}
