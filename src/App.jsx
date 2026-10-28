const nextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);

    if (currentQuestionIdx + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIdx(idx => idx + 1);
    } else {
      setQuizFinished(true);

      const completionKey = `${activeQuiz.id}_${quizMode}`;
      const isFirstTimeCompletion = !completedQuizModes.includes(completionKey);

      if (quizMode === 'practice') {
        // Unlock challenge mode, no coins or XP awarded for practice
        setLockedChallengeQuizIds(prev => prev.filter(id => id !== activeQuiz.id));
        showToast(
          "📖 Practice Mode Completed! Challenge Mode UNLOCKED 🔓 (0 Coins & 0 XP awarded in Practice)", 
          "info"
        );
      } else {
        // Challenge / O-Level mode: 2 coins per correct answer + 5 bonus coins for 5 hearts intact
        const baseCoins = score * 2;
        const heartBonus = (hearts === 5 && score === activeQuiz.questions.length) ? 5 : 0;
        const totalCoins = baseCoins + heartBonus;
        const earnedXp = score * 10;

        if (isFirstTimeCompletion) {
          playSound('coin');
          setCoins(c => c + totalCoins);
          setXp(x => x + earnedXp);
          setCompletedQuizModes(prev => [...prev, completionKey]);

          const bonusText = heartBonus > 0 ? " (includes +5 Perfect 5-Heart Bonus!)" : "";
          showToast(
            `🏆 Challenge Passed! +${totalCoins} Coins${bonusText} & +${earnedXp} XP!`, 
            "success"
          );
        } else {
          showToast(
            "🏆 Challenge Finished! First-completion coins were already claimed for this quiz.", 
            "info"
          );
        }
      }
    }
  };