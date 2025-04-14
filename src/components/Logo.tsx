import React from 'react';
import { ShieldCheck } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-primary/10 p-1 rounded">
        <ShieldCheck className="h-5 w-5 text-primary" />
      </div>
      <div className="font-bold text-lg">
        <span className="text-primary">Fin</span>
        <span>Reg</span>
      </div>
    </div>
  );
};

export default Logo;