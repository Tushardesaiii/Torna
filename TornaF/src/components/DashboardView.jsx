import React from 'react';
import {
  BookOpenIcon,
  FireIcon,
  CalendarIcon,
  DocumentTextIcon,
  SquaresPlusIcon,
  FolderOpenIcon,
  ChevronRightIcon,
  XCircleIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

import {
  Card,
  SectionHeader,
  MetricCard,
  Button,
  ProgressBar,
  Pill,
  Icon,
  EmptyState
} from './SharedUI.jsx';

import {
  formatDate,
  formatRelativeTime,
  pluralize,
  calculateProgress,
  getDueDateStatus
} from '../utils/helper.js';

const DashboardView = React.memo(({ user, onCreateProject, onCreateDocument }) => {
  const latestDailyWordCount = user?.wordCountHistory?.[user.wordCountHistory.length - 1] || { words: 0, goalAchieved: false };
  const dailyWordGoal = user?.dailyWordGoal || 0;
  const goalProgress = calculateProgress(latestDailyWordCount.words, dailyWordGoal);

  const totalWordsWrittenFormatted = (user?.totalWordsWritten || 0).toLocaleString();
  const writingStreakFormatted = pluralize(user?.writingStreak || 0, "day");

  const recentProjects = React.useMemo(() => {
    const sorted = [...(user?.projects || [])].sort((a, b) => new Date(b.lastEdited) - new Date(a.lastEdited));
    return sorted.slice(0, 3);
  }, [user?.projects?.length]);

  const currentDayGoalAchieved = latestDailyWordCount.goalAchieved;

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-black font-inter">
      <SectionHeader
        title={`Welcome back, ${user?.fullName?.split(' ')[0] || 'Writer'}!`}
        description="Here's a snapshot of your writing journey."
      />

      {/* Hero Metrics & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Words"
          value={totalWordsWrittenFormatted}
          icon={BookOpenIcon}
          color="text-emerald-400"
          description="Across all your work"
        />
        <MetricCard
          title="Writing Streak"
          value={writingStreakFormatted}
          icon={FireIcon}
          color="text-amber-400"
          description="Consecutive days writing"
        />
        <MetricCard
          title="Daily Goal"
          value={`${latestDailyWordCount.words}/${dailyWordGoal} words`}
          icon={CalendarIcon}
          color={currentDayGoalAchieved ? "text-indigo-400" : "text-amber-400"}
          description={currentDayGoalAchieved ? "Goal achieved for today!" : "Keep writing!"}
        />
        <Card className="flex flex-col justify-center items-center p-4 bg-zinc-900/50 border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-200 mb-3">Quick Actions</h3>
          <div className="flex flex-col space-y-3 w-full">
            <Button onClick={onCreateDocument} icon={DocumentTextIcon} primary={false} className="w-full group">
              New Document
            </Button>
            <Button onClick={onCreateProject} icon={SquaresPlusIcon} primary={true} className="w-full group">
              New Project
            </Button>
          </div>
        </Card>
      </div>

      {/* Daily Goal Progress */}
      <Card className="mb-8 bg-zinc-900/50 border-zinc-800 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-zinc-200">Today's Writing Goal</h3>
          <span className="text-indigo-300 font-bold">{goalProgress.toFixed(0)}%</span>
        </div>
        <ProgressBar
          progress={goalProgress}
          label="Daily Goal Progress"
          barColor={currentDayGoalAchieved ? "bg-indigo-600" : "bg-amber-500"}
        />
        <p className="text-sm text-zinc-500 mt-2">
          {currentDayGoalAchieved
            ? "You've crushed your goal today! Keep up the excellent work."
            : `Write ${dailyWordGoal - latestDailyWordCount.words} more words to hit your goal.`}
        </p>
      </Card>

      {/* Recent Projects */}
      <SectionHeader
        title="Recent Projects"
        description="Jump back into your latest creations."
        actionButton={<Button primary={false} small icon={FolderOpenIcon} className="group">View All Projects</Button>}
      />

      {(user?.projects?.length || 0) > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {recentProjects.map((project) => (
            <Card key={project._id} className="relative group flex flex-col justify-between bg-zinc-900/50 border-zinc-800 shadow-lg">
              <div>
                <h4 className="text-lg font-semibold text-zinc-100 mb-2 truncate group-hover:text-indigo-400 transition-colors duration-200">
                  {project.title}
                </h4>
                <p className="text-zinc-500 text-sm mb-3 line-clamp-2">{project.description}</p>
                <div className="flex items-center text-zinc-400 text-xs space-x-4 mb-3">
                  <span className="flex items-center">
                    <Icon component={DocumentTextIcon} className="w-3.5 h-3.5 mr-1 text-zinc-600" />
                    {pluralize(project.totalDocuments, "document")}
                  </span>
                  <span className="flex items-center">
                    <Icon component={BookOpenIcon} className="w-3.5 h-3.5 mr-1 text-zinc-600" />
                    {(project.wordCount || 0).toLocaleString()} words
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800/70">
                <Pill
                  text={project.status}
                  className={`${
                    project.status === 'In Progress'
                      ? 'bg-indigo-900/20 text-indigo-300 border-indigo-800/50'
                      : project.status === 'Planning'
                      ? 'bg-gray-800/30 text-gray-400 border-gray-700/50'
                      : 'bg-emerald-900/20 text-emerald-300 border-emerald-800/50'
                  }`}
                />
                {project.dueDate && (
                  <span className={`flex items-center text-xs font-medium ${getDueDateStatus(project.dueDate)?.color}`}>
                    <Icon component={getDueDateStatus(project.dueDate)?.icon} className="w-3.5 h-3.5 mr-1" />
                    {getDueDateStatus(project.dueDate)?.text}
                  </span>
                )}
                <Button small primary={false} icon={ChevronRightIcon} className="!px-2 !py-1 group">
                  Open
                </Button>
              </div>
              {project.collaborators && project.collaborators.length > 0 && (
                <div className="absolute top-4 right-4 flex -space-x-1 overflow-hidden">
                  {/* Collaborator avatars would go here */}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpenIcon}
          title="No Projects Yet"
          description="Start your creative journey by creating your first project!"
          actionButton={<Button onClick={onCreateProject} icon={PlusIcon} primary>Create New Project</Button>}
        />
      )}
    </div>
  );
});

export default DashboardView;
