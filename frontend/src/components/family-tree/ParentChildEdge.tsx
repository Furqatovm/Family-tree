import React from 'react';
import { BaseEdge, getSmoothStepPath, EdgeProps } from '@xyflow/react';

export const ParentChildEdge: React.FC<EdgeProps> = (props) => {
  const [edgePath] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
    borderRadius: 12,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={props.markerEnd}
        style={{
          stroke: '#3F6B4F', // Forest green for parent-child lineage
          strokeWidth: 2,
        }}
      />
    </>
  );
};
