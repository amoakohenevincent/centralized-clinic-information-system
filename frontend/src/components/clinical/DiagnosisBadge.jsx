import React from 'react';
import Badge from '../common/Badge';

const DiagnosisBadge = ({ diagnosis }) => {
  if (!diagnosis) return null;

  return (
    <div className="inline-flex items-center gap-2 bg-slate-50 px-3.5 py-1.5 rounded-2xl border border-slate-200/80 shadow-xs">
      <span className="text-xs font-bold text-slate-900">{diagnosis.diagnosisName}</span>
      {diagnosis.diagnosisCode && (
        <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg">
          {diagnosis.diagnosisCode}
        </span>
      )}
      <Badge variant={diagnosis.diagnosisType === 'primary' ? 'teal' : 'neutral'}>
        {diagnosis.diagnosisType}
      </Badge>
      <Badge variant={diagnosis.severity === 'severe' || diagnosis.severity === 'critical' ? 'urgent' : diagnosis.severity === 'moderate' ? 'amber' : 'neutral'}>
        {diagnosis.severity}
      </Badge>
    </div>
  );
};

export default DiagnosisBadge;
