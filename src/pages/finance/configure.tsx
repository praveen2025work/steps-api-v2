import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/DashboardLayout';
import { TileConfigurator } from '@/components/finance/TileConfigurator';

export default function ConfigureTilesPage() {
  const router = useRouter();
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Configure Finance Dashboard Tiles</h1>
          <button 
            onClick={() => router.push('/finance')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Back to Dashboard
          </button>
        </div>
        <TileConfigurator />
      </div>
    </DashboardLayout>
  );
}