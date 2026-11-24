import React from 'react';
import Badge from '../common/Badge';

const DiagnosisBadge = ({ diagnosis }) => {
  if (!diagnosis) return null;

  return (
    <div className="inline-flex flex-wrap items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-300">
      <span className="text-xs font-bold text-slate-900">{diagnosis.diagnosisName}</span>
      {diagnosis.diagnosisCode && (
        <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded">
          {diagnosis.diagnosisCode}
        </span>
      )}
      <Badge variant={diagnosis.diagnosisType === 'primary' ? 'teal' : 'neutral'}>
        {diagnosis.diagnosisType}
      </Badge>
      <Badge variant={diagnosis.severity === 'severe' || diagnosis.severity === 'critical' ? 'urgent' : 'neutral'}>
        {diagnosis.severity}
      </Badge>
    </div>
  );
};

export default DiagnosisBadge;
