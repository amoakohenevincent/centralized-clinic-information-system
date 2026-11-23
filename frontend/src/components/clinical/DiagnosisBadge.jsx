import React from 'react';
import Badge from '../common/Badge';

const DiagnosisBadge = ({ diagnosis }) => {
  if (!diagnosis) return null;

  const severityVariant = {
    mild: 'green',
    moderate: 'yellow',
    severe: 'orange',
    critical: 'red',
  }[diagnosis.severity] || 'gray';

  const typeVariant = {
    primary: 'blue',
    secondary: 'gray',
    differential: 'purple',
    provisional: 'orange',
  }[diagnosis.diagnosisType] || 'gray';

  return (
    <div className="inline-flex items-center gap-2 bg-[#fbfbfa] px-3 py-1.5 rounded-none border border-[#e9e9e7]">
      <span className="text-xs font-bold text-[#191919]">{diagnosis.diagnosisName}</span>
      {diagnosis.diagnosisCode && (
        <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[#f1f1ef] text-[#191919] border border-[#e5e5e3] rounded-none">
          {diagnosis.diagnosisCode}
        </span>
      )}
      <Badge variant={typeVariant}>{diagnosis.diagnosisType}</Badge>
      <Badge variant={severityVariant}>{diagnosis.severity}</Badge>
    </div>
  );
};

export default DiagnosisBadge;
