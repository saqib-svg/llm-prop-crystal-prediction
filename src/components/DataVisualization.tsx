import { Card } from './ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

// Simulated dataset distribution
const dataDistribution = [
  { predicted: 0.8, actual: 0.66, name: 'Ge' },
  { predicted: 1.15, actual: 1.12, name: 'Si' },
  { predicted: 1.39, actual: 1.42, name: 'GaAs' },
  { predicted: 2.3, actual: 2.4, name: 'Sample 1' },
  { predicted: 2.8, actual: 2.7, name: 'Sample 2' },
  { predicted: 3.1, actual: 3.0, name: 'Sample 3' },
  { predicted: 3.42, actual: 3.37, name: 'ZnO' },
  { predicted: 3.8, actual: 3.9, name: 'Sample 4' },
  { predicted: 4.2, actual: 4.1, name: 'Sample 5' },
  { predicted: 4.6, actual: 4.8, name: 'Sample 6' },
  { predicted: 5.1, actual: 5.0, name: 'Sample 7' },
  { predicted: 5.6, actual: 5.8, name: 'Sample 8' },
  { predicted: 6.15, actual: 6.28, name: 'AlN' },
  { predicted: 6.5, actual: 6.3, name: 'Sample 9' },
  { predicted: 7.2, actual: 7.4, name: 'Sample 10' }
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-sm">{payload[0].payload.name}</p>
        <p className="text-xs text-muted-foreground">Predicted: {payload[0].payload.predicted} eV</p>
        <p className="text-xs text-muted-foreground">Actual: {payload[0].payload.actual} eV</p>
        <p className="text-xs text-muted-foreground">
          Error: {Math.abs(payload[0].payload.predicted - payload[0].payload.actual).toFixed(2)} eV
        </p>
      </div>
    );
  }
  return null;
};

export function DataVisualization() {
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-4">Predicted vs Actual Band Gaps</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Scatter plot showing model predictions against actual DFT-calculated values. Points closer to the diagonal line indicate better predictions.
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            dataKey="actual" 
            name="Actual Band Gap (eV)" 
            label={{ value: 'Actual Band Gap (eV)', position: 'bottom' }}
            domain={[0, 8]}
          />
          <YAxis 
            type="number" 
            dataKey="predicted" 
            name="Predicted Band Gap (eV)"
            label={{ value: 'Predicted Band Gap (eV)', angle: -90, position: 'insideLeft' }}
            domain={[0, 8]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {/* Ideal prediction line (y=x) */}
          <Scatter 
            name="Ideal Prediction (y=x)" 
            data={[{actual: 0, predicted: 0}, {actual: 8, predicted: 8}]} 
            line={{ stroke: '#94a3b8', strokeDasharray: '5 5' }} 
            fill="transparent"
            shape="circle"
          />
          {/* Actual predictions */}
          <Scatter 
            name="Model Predictions" 
            data={dataDistribution} 
            fill="#3b82f6"
          >
            {dataDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#3b82f6" />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
        <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Performance Summary
        </div>
        <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <p>• R² Score: 0.94 (strong correlation between predicted and actual values)</p>
          <p>• Points clustered near the diagonal line indicate high prediction accuracy</p>
          <p>• Model performs well across the full range of band gap values (0-8 eV)</p>
        </div>
      </div>
    </Card>
  );
}
