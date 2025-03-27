/**
 * Calculates the game score based on performance.
 * @param correctAnswers Number of correct quiz answers.
 * @param incorrectAnswers Number of incorrect quiz answers.
 * @param moves Number of full moves made by the player (e.g., 1. e4 e5 is 2 moves).
 * @param questionsResetCount Number of times the quiz questions were reset (cycled through). Defaults to 0.
 * @returns The final calculated score.
 */
export const calculateScore = (
  correctAnswers: number,
  incorrectAnswers: number,
  moves: number,
  questionsResetCount: number = 0 // Add the new parameter with a default value
): number => {
  const baseScore = 100;
  const quizBonus = correctAnswers * 10;
  const quizPenalty = incorrectAnswers * 5;
  const movePenalty = moves; // 1 point per player move (already calculated as full moves)
  const resetPenalty = questionsResetCount * 25; // Penalty for each time questions reset

  console.log(`DEBUG: Scoring - Base: ${baseScore}, QuizBonus: ${quizBonus}, QuizPenalty: ${quizPenalty}, MovePenalty: ${movePenalty}, ResetPenalty: ${resetPenalty} (Resets: ${questionsResetCount})`);

  // Ensure score doesn't go below 0
  const finalScore = Math.max(0, baseScore + quizBonus - quizPenalty - movePenalty - resetPenalty);

  console.log(`DEBUG: Final Score: ${finalScore}`);
  return finalScore;
};