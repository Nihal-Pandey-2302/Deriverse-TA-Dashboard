import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <Header />
      <div className="flex-1 space-y-6 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <Card>
          <CardHeader>
             <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Settings configuration coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
