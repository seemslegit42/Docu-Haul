
"use client"
import React from 'react';
import { cn } from '@/lib/utils';
import { formatWeightBilingual, formatPressureBilingual } from '@/lib/utils';

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

const Checkbox = ({ checked, label }: { checked: boolean; label: string }) => (
    <div className="flex items-center gap-1">
        <div className="h-3 w-3 border border-black flex items-center justify-center">
            {checked && <div className="h-[9px] w-[9px] bg-black" />}
        </div>
        <span className="font-semibold">{label}</span>
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
        const singleOrDualValue = (data['SINGLE_OR_DUAL'] || '').toLowerCase();
        const isSingle = singleOrDualValue === 'single';
        const isDual = singleOrDualValue === 'dual';
        
        const bilingualContainerClass = "bg-white text-black font-body flex flex-col w-[450px] min-h-[250px] border-2 border-black text-[9px] leading-tight";

        return (
             <div ref={ref} className={bilingualContainerClass}>
                {/* Row 1: Manufacturer & Date */}
                <div className="flex justify-between border-b border-black p-1">
                    <span className="font-bold">MANUFACTURED BY / FABRIQUE PAR: <span className="font-semibold">{data['MANUFACTURED BY / FABRIQUE PAR']}</span></span>
                    <span className="font-bold">DATE: <span className="font-semibold">{data['DATE']}</span></span>
                </div>
                {/* Row 2: Weights & Tires */}
                <div className="flex border-b border-black">
                    <div className="w-2/3 border-r border-black">
                        <div className="flex">
                            <div className="w-2/5 p-1 font-bold">GVWR / PNBV</div>
                            <div className="w-3/5 p-1 font-semibold">{formatWeightBilingual(data['GVWR / PNBV'])}</div>
                        </div>
                        <div className="flex border-t border-black">
                             <div className="w-2/5 p-1 font-bold">GAWR (EACH AXLE) / PNBE (CHAQUE ESSIEU)</div>
                            <div className="w-3/5 p-1 font-semibold">{formatWeightBilingual(data['GAWR (EACH AXLE) / PNBE (CHAQUE ESSIEU)'])}</div>
                        </div>
                    </div>
                    <div className="w-1/3 p-1 font-bold">TIRES / PNEU: <span className="font-semibold">{data['TIRES / PNEU']}</span></div>
                </div>
                 {/* Row 3: Rims, Pressure, Single/Dual */}
                <div className="flex border-b border-black items-center">
                    <div className="w-1/3 p-1 border-r border-black font-bold">RIMS / JANTE: <span className="font-semibold">{data['RIMS / JANTE']}</span></div>
                    <div className="flex-grow p-1 font-bold">COLD INFL. PRESS. / PRESS. DE GONFL. A FROID: <span className="font-semibold">{formatPressureBilingual(data['COLD INFL. PRESS. / PRESS. DE GONFL. A FROID'])}</span></div>
                    <div className="flex gap-2 p-1">
                         <Checkbox checked={isSingle} label="SINGLE" />
                         <Checkbox checked={isDual} label="DUAL" />
                    </div>
                </div>
                {/* Row 4: Compliance Statement */}
                <div className="flex-grow flex items-center justify-center p-1 border-b border-black">
                     <p className="text-center text-[7px] leading-snug px-1 whitespace-pre-wrap">{data['COMPLIANCE_STATEMENT']}</p>
                </div>
                 {/* Row 5: VIN & Type */}
                 <div className="flex justify-between p-1">
                    <span className="font-bold">V.I.N. / N.I.V.: <span className="font-semibold tracking-wide">{data['V.I.N. / N.I.V.']}</span></span>
                    <span className="font-bold">TYPE / TYPE: <span className="font-semibold">{data['TYPE / TYPE']}</span></span>
                 </div>
            </div>
        );
    }
      
    return null;
});

VinLabel.displayName = 'VinLabel';
