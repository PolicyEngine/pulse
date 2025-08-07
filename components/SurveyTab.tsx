'use client';

import { useState } from 'react';
import { dataService } from '@/lib/dataService';

interface SurveyData {
  name: string;
  weekEnding: string;
  blockedPercentage: number;
  feelSupported: number;
  workload: number;
  learnedNewSkills: number;
  meetingProductivity: number;
  soloProductivity: number;
  weekQuality: number;
  feedback: string;
}

export default function SurveyTab() {
  const [formData, setFormData] = useState<SurveyData>({
    name: '',
    weekEnding: new Date().toISOString().split('T')[0],
    blockedPercentage: 5,
    feelSupported: 5,
    workload: 5,
    learnedNewSkills: 5,
    meetingProductivity: 5,
    soloProductivity: 5,
    weekQuality: 5,
    feedback: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await dataService.saveSurveyResponse(formData);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          ...formData,
          blockedPercentage: 5,
          feelSupported: 5,
          workload: 5,
          learnedNewSkills: 5,
          meetingProductivity: 5,
          soloProductivity: 5,
          weekQuality: 5,
          feedback: '',
        });
      }, 3000);
    } catch (error) {
      console.error('Error submitting survey:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit survey. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingScale = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'var(--font-roboto)' }}>
        {label}
      </label>
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
              value === num
                ? 'bg-[#2C6496] text-white'
                : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
            }`}
            style={{ fontFamily: 'var(--font-roboto-mono)' }}
          >
            {num}
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-500" style={{ fontFamily: 'var(--font-roboto)' }}>
          (1 = Low, 10 = High)
        </span>
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3" style={{ fontFamily: 'var(--font-roboto-serif)' }}>
            Thanks for your feedback!
          </h2>
          <p className="text-gray-600 text-center max-w-md" style={{ fontFamily: 'var(--font-roboto)' }}>
            Your weekly survey has been recorded. We&apos;ll review the team&apos;s responses during our next meeting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6" style={{ fontFamily: 'var(--font-roboto-serif)' }}>
        Weekly team survey
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'var(--font-roboto)' }}>
              Your name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C6496] focus:border-transparent"
              style={{ fontFamily: 'var(--font-roboto)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'var(--font-roboto)' }}>
              Week ending
            </label>
            <input
              type="date"
              required
              value={formData.weekEnding}
              onChange={(e) => setFormData({ ...formData, weekEnding: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C6496] focus:border-transparent"
              style={{ fontFamily: 'var(--font-roboto)' }}
            />
          </div>
        </div>

        <RatingScale
          label="What percentage of your time were you blocked on your main task?"
          value={formData.blockedPercentage}
          onChange={(v) => setFormData({ ...formData, blockedPercentage: v })}
        />

        <RatingScale
          label="Do you generally feel supported at work?"
          value={formData.feelSupported}
          onChange={(v) => setFormData({ ...formData, feelSupported: v })}
        />

        <RatingScale
          label="How's your workload? (1 = underloaded, 5 = perfect, 10 = overloaded)"
          value={formData.workload}
          onChange={(v) => setFormData({ ...formData, workload: v })}
        />

        <RatingScale
          label="Did you learn new skills this week?"
          value={formData.learnedNewSkills}
          onChange={(v) => setFormData({ ...formData, learnedNewSkills: v })}
        />

        <RatingScale
          label="How productive was your time in meetings?"
          value={formData.meetingProductivity}
          onChange={(v) => setFormData({ ...formData, meetingProductivity: v })}
        />

        <RatingScale
          label="How productive was your time outside of meetings?"
          value={formData.soloProductivity}
          onChange={(v) => setFormData({ ...formData, soloProductivity: v })}
        />

        <RatingScale
          label="How good was this week overall?"
          value={formData.weekQuality}
          onChange={(v) => setFormData({ ...formData, weekQuality: v })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'var(--font-roboto)' }}>
            Additional feedback (optional)
          </label>
          <textarea
            value={formData.feedback}
            onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C6496] focus:border-transparent"
            style={{ fontFamily: 'var(--font-roboto)' }}
            placeholder="Optional"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-[#2C6496] text-white rounded-lg hover:bg-[#1e4668] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          style={{ fontFamily: 'var(--font-roboto)' }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit survey'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm" style={{ fontFamily: 'var(--font-roboto)' }}>
              {error}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}