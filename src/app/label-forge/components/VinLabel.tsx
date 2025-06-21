
"use client"
import React from 'react';
import { cn } from '@/lib/utils';
import { formatWeightBilingual } from '@/lib/utils';

interface VinLabelProps {
  data: Record<string, string>;
  template: 'standard' | 'bilingual_canadian';
}

const LabelRow = ({ label, value, valueClass }: { label: string; value?: string; valueClass?: string }) => (
    <div className="flex border-b border-black">
      <div className="w-1/3 border-r border-black p-1 font-bold text-xs">{label}</div>
      <div className={cn("w-2/3 p-1 text-xs font-semibold", valueClass)}>{value || ''}</div>
    </div>
);

const BilingualLabelRow = ({ label, value }: { label: string; value?: string }) => (
    <div className="flex border-b border-black text-xs">
        <div className="w-1/2 p-1 font-bold">{label}</div>
        <div className="w-1/2 p-1 font-semibold border-l border-black">{value || ''}</div>
    </div>
);

const Checkbox = ({ checked, label }: { checked: boolean; label: string }) => (
    <div className="flex items-center gap-1">
        <div className="h-3 w-3 border border-black flex items-center justify-center">
            {checked && <span className="font-bold text-[10px] leading-none">X</span>}
        </div>
        <span>{label}</span>
    </div>
);


export const VinLabel = React.forwardRef<HTMLDivElement, VinLabelProps>(({ data, template }, ref) => {

    const mainContainerClass = "bg-white text-black font-mono flex flex-col w-[450px] min-h-[250px] border-2 border-black text-[10px] leading-tight";
    
    if (template === 'standard') {
        const tireInfo = `TIRE: ${data['TIRE'] || ''} RIM: ${data['RIM'] || ''}`;
        const pressureInfo = `PSI: ${data['PSI'] || ''}`;

        return (
            <div ref={ref} className={mainContainerClass}>
                <div className="flex-grow flex flex-col">
                    <LabelRow label="MANUFACTURER" value={data['MANUFACTURER']} />
                    <LabelRow label="DATE OF MANUF." value={data['DATE OF MANUF.']} />
                    <div className="flex border-b border-black">
                        <div className="w-1/3 border-r border-black p-1 font-bold text-xs">GVWR</div>
                        <div className="w-2/3 p-1 text-xs font-semibold">{data['GVWR']}</div>
                    </div>
                    <div className="flex border-b border-black">
                        <div className="w-1/3 border-r border-black p-1 font-bold text-xs">GAWR</div>
                        <div className="w-2/3 p-1 text-xs font-semibold">{data['GAWR']}</div>
                    </div>
                     <div className="flex border-b border-black">
                        <div className="w-1/3 border-r border-black p-1 font-bold text-xs flex flex-col justify-center">
                            <span>TIRE, RIM, PSI</span>
                        </div>
                        <div className="w-2/3 p-1 text-xs font-semibold">
                            <div>{tireInfo}</div>
                            <div>{pressureInfo}</div>
                        </div>
                    </div>
                    <div className="flex-grow flex items-center justify-center border-b border-black">
                        <p className="text-center text-[8px] px-2">{data['COMPLIANCE_STATEMENT']}</p>
                    </div>
                    <div className="flex">
                        <LabelRow label="VIN" value={data['VIN']} valueClass="tracking-wider" />
                    </div>
                    <div className="flex">
                         <LabelRow label="TYPE" value={data['TYPE']} />
                    </div>
                </div>
            </div>
        );
    }
    
    if (template === 'bilingual_canadian') {
        const isSingle = data['SINGLE_OR_DUAL']?.toLowerCase() === 'single';
        const isDual = data['SINGLE_OR_DUAL']?.toLowerCase() === 'dual';

        return (
             <div ref={ref} className={mainContainerClass}>
                <BilingualLabelRow label="MANUFACTURED BY / FABRIQUE PAR:" value={data['MANUFACTURED BY / FABRIQUE PAR']} />
                <BilingualLabelRow label="DATE:" value={data['DATE']} />
                <BilingualLabelRow label="GVWR / PNBV:" value={formatWeightBilingual(data['GVWR / PNBV'])} />
                <BilingualLabelRow label="GAWR (EACH AXLE) / PNBE (CHAQUE ESSIEU):" value={formatWeightBilingual(data['GAWR (EACH AXLE) / PNBE (CHAQUE ESSIEU)'])} />
                <BilingualLabelRow label="TIRES / PNEU:" value={data['TIRES / PNEU']} />
                <BilingualLabelRow label="RIMS / JANTE:" value={data['RIMS / JANTE']} />
                <BilingualLabelRow label="COLD INFL. PRESS. / PRESS. DE GONFL. A FROID:" value={`${data['COLD INFL. PRESS. / PRESS. DE GONFL. A FROID']} KPA ( PSI / LPC)`} />
                 <div className="flex border-b border-black text-xs">
                    <div className="w-1/2 p-1 font-bold flex items-center gap-2">
                        <Checkbox checked={isSingle} label="SINGLE" />
                        <Checkbox checked={isDual} label="DUAL" />
                    </div>
                    <div className="w-1/2 p-1 font-bold border-l border-black flex items-center gap-2">
                        <Checkbox checked={isSingle} label="SIMPLE" />
                        <Checkbox checked={isDual} label="JUMELEE" />
                    </div>
                </div>
                <BilingualLabelRow label="V.I.N. / N.I.V.:" value={data['V.I.N. / N.I.V.']} />
                <BilingualLabelRow label="TYPE / TYPE:" value={data['TYPE / TYPE']} />
                <div className="flex-grow flex items-center justify-center p-1">
                    <p className="text-center text-[8px] leading-snug">{data['COMPLIANCE_STATEMENT']}</p>
                </div>
            </div>
        );
    }
      
    return null;
});

VinLabel.displayName = 'VinLabel';
