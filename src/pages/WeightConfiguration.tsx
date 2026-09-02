import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/common/UI';
import { Save, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WeightConfiguration() {
  const { apis, updateWeights, isLoading } = useAppStore();
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const initialWeights: Record<string, number> = {};
    apis.forEach(api => {
      initialWeights[api.id] = api.weight * 100;
    });
    setWeights(initialWeights);
  }, [apis]);

  const totalWeight = Object.values(weights).reduce((acc, curr) => acc + curr, 0);
  const isValid = Math.abs(totalWeight - 100) < 0.01;

  const handleWeightChange = (id: string, value: number) => {
    setWeights(prev => ({
      ...prev,
      [id]: Math.min(100, Math.max(0, value))
    }));
  };

  const handleSave = async () => {
    if (!isValid) {
      toast.error('Total weight must equal exactly 100%');
      return;
    }
    
    setIsSaving(true);
    try {
      // Convert back to 0-1 scale for the backend/store
      const normalizedWeights: Record<string, number> = {};
      Object.keys(weights).forEach(k => {
        normalizedWeights[k] = weights[k] / 100;
      });
      
      await updateWeights(normalizedWeights);
      toast.success('Weights updated successfully');
    } catch (error) {
      toast.error('Failed to update weights');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const initialWeights: Record<string, number> = {};
    apis.forEach(api => {
      initialWeights[api.id] = api.weight * 100;
    });
    setWeights(initialWeights);
    toast('Reset to current saved weights', { icon: '🔄' });
  };

  if (isLoading) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Weight Configuration</h2>
        <p className="text-muted-foreground">Adjust the influence of each API category on the final score.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Category Weights</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Total:</span>
            <Badge variant={isValid ? 'success' : 'destructive'} className="text-sm px-3 py-1">
              {Math.round(totalWeight)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {!isValid && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md flex items-start gap-3">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">Invalid Total Weight</h4>
                <p className="text-sm opacity-90">The sum of all weights must be exactly 100%. Currently it is {Math.round(totalWeight)}%.</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {apis.map(api => (
              <div key={api.id} className="space-y-3">
                <div className="flex justify-between items-center">
                  <label htmlFor={`slider-${api.id}`} className="font-medium">
                    {api.name}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={Math.round(weights[api.id] || 0)}
                      onChange={(e) => handleWeightChange(api.id, Number(e.target.value))}
                      className="w-16 px-2 py-1 text-right border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min={0}
                      max={100}
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    id={`slider-${api.id}`}
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={weights[api.id] || 0}
                    onChange={(e) => handleWeightChange(api.id, Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t flex items-center justify-end gap-4">
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-muted text-muted-foreground font-medium transition-colors"
            >
              <RefreshCw size={18} />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid || isSaving}
              className="flex items-center gap-2 px-6 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}