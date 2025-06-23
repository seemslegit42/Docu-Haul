'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { formatWeightBilingual, formatPressureBilingual } from '@/lib/utils';

interface VinLabelProps {
  data: Record<string, string>;
  template:
    | 'standard'
    | 'bilingual_canadian'
    | 'bilingual_rv_canadian'
    | 'tire_and_loading'
    | 'multi_axle_heavy_duty';
}

const LabelRow = ({
  label,
  value,
  valueClass,
}: {
  label: string;
  value?: string;
  valueClass?: string;
}) => (
  <div className="flex border-b border-black">
    <div className="w-1/3 border-r border-black p-1 font-bold text-xs">{label}</div>
    <div className={cn('w-2/3 p-1 text-xs font-semibold', valueClass)}>{value || ''}</div>
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

export const VinLabel = React.forwardRef<HTMLDivElement, VinLabelProps>(
  ({ data, template }, ref) => {
    const mainContainerClass =
      'bg-white text-black font-mono flex flex-col w-[450px] min-h-[250px] border-2 border-black text-[10px] leading-tight';

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

      const bilingualContainerClass =
        'bg-white text-black font-body flex flex-col w-[450px] min-h-[250px] border-2 border-black text-[9px] leading-tight';

      return (
        <div ref={ref} className={bilingualContainerClass}>
          {/* Row 1: Manufacturer & Date */}
          <div className="flex justify-between border-b border-black p-1">
            <span className="font-bold">
              MANUFACTURED BY / FABRIQUE PAR:{' '}
              <span className="font-semibold">{data['MANUFACTURED BY / FABRIQUE PAR']}</span>
            </span>
            <span className="font-bold">
              DATE: <span className="font-semibold">{data['DATE']}</span>
            </span>
          </div>
          {/* Row 2: Weights & Tires */}
          <div className="flex border-b border-black">
            <div className="w-2/3 border-r border-black">
              <div className="flex">
                <div className="w-2/5 p-1 font-bold">GVWR / PNBV</div>
                <div className="w-3/5 p-1 font-semibold">
                  {formatWeightBilingual(data['GVWR / PNBV'])}
                </div>
              </div>
              <div className="flex border-t border-black">
                <div className="w-2/5 p-1 font-bold">GAWR (EACH AXLE) / PNBE (CHAQUE ESSIEU)</div>
                <div className="w-3/5 p-1 font-semibold">
                  {formatWeightBilingual(data['GAWR (EACH AXLE) / PNBE (CHAQUE ESSIEU)'])}
                </div>
              </div>
            </div>
            <div className="w-1/3 p-1 font-bold">
              TIRES / PNEU: <span className="font-semibold">{data['TIRES / PNEU']}</span>
            </div>
          </div>
          {/* Row 3: Rims, Pressure, Single/Dual */}
          <div className="flex border-b border-black items-center">
            <div className="w-1/3 p-1 border-r border-black font-bold">
              RIMS / JANTE: <span className="font-semibold">{data['RIMS / JANTE']}</span>
            </div>
            <div className="flex-grow p-1 font-bold">
              COLD INFL. PRESS. / PRESS. DE GONFL. A FROID:{' '}
              <span className="font-semibold">
                {formatPressureBilingual(data['COLD INFL. PRESS. / PRESS. DE GONFL. A FROID'])}
              </span>
            </div>
            <div className="flex gap-2 p-1">
              <Checkbox checked={isSingle} label="SINGLE" />
              <Checkbox checked={isDual} label="DUAL" />
            </div>
          </div>
          {/* Row 4: Compliance Statement */}
          <div className="flex-grow flex items-center justify-center p-1 border-b border-black">
            <p className="text-center text-[7px] leading-snug px-1 whitespace-pre-wrap">
              {data['COMPLIANCE_STATEMENT']}
            </p>
          </div>
          {/* Row 5: VIN & Type */}
          <div className="flex justify-between p-1">
            <span className="font-bold">
              V.I.N. / N.I.V.:{' '}
              <span className="font-semibold tracking-wide">{data['V.I.N. / N.I.V.']}</span>
            </span>
            <span className="font-bold">
              TYPE / TYPE: <span className="font-semibold">{data['TYPE / TYPE']}</span>
            </span>
          </div>
        </div>
      );
    }

    if (template === 'bilingual_rv_canadian') {
      const rvContainerClass =
        'bg-white text-black font-sans flex flex-col w-[360px] min-h-[560px] border-2 border-black text-[9px] leading-tight p-2 font-bold';

      const LabeledValue = ({
        label,
        value,
        valueClass,
      }: {
        label: string;
        value: string;
        valueClass?: string;
      }) => (
        <div>
          <div className="text-[8px]">{label}</div>
          <div
            className={cn(
              'text-center border-b-2 border-black pb-0.5 font-semibold tracking-wide',
              valueClass
            )}
          >
            {value || <>&nbsp;</>}
          </div>
        </div>
      );

      const TwoPartValue = ({ val1, val2 }: { val1: string; val2: string }) => (
        <div className="flex gap-4">
          <div className="flex-1 text-center border-b-2 border-black pb-0.5 font-semibold">
            {val1 || <>&nbsp;</>}
          </div>
          <div className="flex-1 text-center border-b-2 border-black pb-0.5 font-semibold">
            {val2 || <>&nbsp;</>}
          </div>
        </div>
      );

      return (
        <div ref={ref} className={rvContainerClass}>
          {/* Top Section */}
          <div className="grid grid-cols-3 gap-x-4">
            {/* Left Column */}
            <div className="flex flex-col gap-2">
              <div>
                <div>RESP MFR:</div>
                <div>FABRICANT RESP:</div>
                <div className="font-semibold">{data['RESP_MFR']}</div>
              </div>
              <div>
                <div>GVWR:/PNBV KG</div>
                <TwoPartValue val1={data['GVWR_LBS']} val2={data['GVWR_KG']} />
              </div>
            </div>
            {/* Center Column */}
            <div className="flex flex-col items-center gap-2 pt-2">
              <div className="text-3xl font-extrabold">{data['BRAND']}</div>
              <LabeledValue label="V.I.N./N.I.V" value={data['VIN']} valueClass="w-full" />
              <LabeledValue label="SIZE/DIMENSION" value={data['SIZE']} valueClass="w-full" />
            </div>
            {/* Right Column */}
            <div className="flex flex-col items-end gap-2">
              <LabeledValue label="" value={data['DATE']} valueClass="w-16" />
              <div className="text-right">
                <div>PRESS./COLD INFL.</div>
                <div>PRESS./GONFL FROID</div>
              </div>
              <div className="w-full">
                <div className="text-right">PSI/LPC&nbsp;&nbsp;&nbsp;KPA</div>
                <TwoPartValue val1={data['FRONT_PSI']} val2={data['FRONT_KPA']} />
                <TwoPartValue val1={data['REAR_PSI']} val2={data['REAR_KPA']} />
              </div>
            </div>
          </div>

          {/* Axle Section */}
          <div className="mt-4 border-y-2 border-black py-2">
            <div className="grid grid-cols-[1.5fr,1fr,1fr] gap-x-2 text-center">
              <div>GAWR:/PNBE KG</div>
              <div>TIRE/PNEU</div>
              <div>RIMS/JANTE</div>
            </div>
            <div className="mt-1 grid grid-cols-[1.5fr,1fr,1fr] gap-x-2 items-center">
              {/* Front Axle */}
              <div className="flex items-center gap-1">
                <div className="flex-grow">
                  <TwoPartValue val1={data['FRONT_GAWR_LBS']} val2={data['FRONT_GAWR_KG']} />
                </div>
                <div className="text-[8px] leading-none">
                  FRONT/
                  <br />
                  DEVANT
                </div>
              </div>
              <LabeledValue label="" value={data['FRONT_TIRE']} />
              <LabeledValue label="" value={data['FRONT_RIM']} />

              {/* Rear Axle */}
              <div className="flex items-center gap-1 mt-1">
                <div className="flex-grow">
                  <TwoPartValue val1={data['REAR_GAWR_LBS']} val2={data['REAR_GAWR_KG']} />
                </div>
                <div className="text-[8px] leading-none">
                  REAR/
                  <br />
                  ARRIERE
                </div>
              </div>
              <LabeledValue label="" value={data['REAR_TIRE']} />
              <LabeledValue label="" value={data['REAR_RIM']} />
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-2 gap-x-4 mt-2 flex-grow text-[7px] leading-snug">
            <div className="font-normal">
              <div className="font-bold">TYPE OF VEHICLE/TYPE DE VEHICULE:</div>
              <p className="mt-1 whitespace-pre-wrap">{data['COMPLIANCE_STATEMENT_VEHICLE']}</p>
            </div>
            <div className="font-normal">
              <div className="font-bold">TRAILER/REMORQUE</div>
              <p className="mt-1 whitespace-pre-wrap">{data['COMPLIANCE_STATEMENT_TRAILER']}</p>
            </div>
          </div>
        </div>
      );
    }

    if (template === 'tire_and_loading') {
      const tireLoadingContainerClass =
        'bg-yellow-300 text-black font-sans flex flex-col w-[450px] min-h-[250px] border-2 border-black p-2 text-[10px] leading-tight';
      const LabeledBox = ({
        label,
        value,
        smallLabel = false,
      }: {
        label: string;
        value?: string;
        smallLabel?: boolean;
      }) => (
        <div className="text-center">
          <div className={cn('font-bold', smallLabel ? 'text-[8px]' : 'text-[10px]')}>{label}</div>
          <div className="border border-black bg-white p-1 font-bold text-lg mt-1 min-w-[40px]">
            {value || ''}
          </div>
        </div>
      );
      return (
        <div ref={ref} className={tireLoadingContainerClass}>
          <div className="flex justify-between items-center">
            <div className="font-bold text-lg">TIRE AND LOADING INFORMATION</div>
            <div className="text-right">
              <div className="font-bold">VIN {data['VIN']}</div>
            </div>
          </div>
          <div className="flex justify-between items-end mt-2">
            <LabeledBox label="SEATING CAPACITY" />
            <div className="flex gap-2">
              <LabeledBox label="TOTAL" value={data['SEATING_CAPACITY_TOTAL']} smallLabel />
              <LabeledBox label="FRONT" value={data['SEATING_CAPACITY_FRONT']} smallLabel />
              <LabeledBox label="REAR" value={data['SEATING_CAPACITY_REAR']} smallLabel />
            </div>
          </div>
          <div className="text-center font-bold mt-2 border-y-2 border-black py-1">
            THE COMBINED WEIGHT OF OCCUPANTS AND CARGO SHOULD NEVER EXCEED
            <div className="flex justify-center gap-2 mt-1">
              <span className="text-lg">{data['VEHICLE_CAPACITY_WEIGHT_LBS'] || '[LBS]'} lbs</span>
              <span className="text-lg">{data['VEHICLE_CAPACITY_WEIGHT_KG'] || '[KG]'} kg</span>
            </div>
          </div>
          <div className="text-center font-bold mt-2">TIRE INFORMATION</div>
          <div className="grid grid-cols-[1fr,2fr,2fr] items-center text-center mt-1 gap-x-1">
            <div />
            <div className="font-bold">SIZE</div>
            <div className="font-bold">COLD TIRE PRESSURE</div>

            <div className="font-bold text-left">FRONT</div>
            <div className="border border-black bg-white p-1 font-semibold">
              {data['TIRE_SIZE_FRONT']}
            </div>
            <div className="border border-black bg-white p-1 font-semibold">
              {data['COLD_TIRE_PRESSURE_FRONT_PSI']} PSI
            </div>

            <div className="font-bold text-left">REAR</div>
            <div className="border border-black bg-white p-1 font-semibold">
              {data['TIRE_SIZE_REAR']}
            </div>
            <div className="border border-black bg-white p-1 font-semibold">
              {data['COLD_TIRE_PRESSURE_REAR_PSI']} PSI
            </div>

            <div className="font-bold text-left">SPARE</div>
            <div className="border border-black bg-white p-1 font-semibold">
              {data['TIRE_SIZE_SPARE']}
            </div>
            <div className="border border-black bg-white p-1 font-semibold">
              {data['COLD_TIRE_PRESSURE_SPARE_PSI']} PSI
            </div>
          </div>
          <div className="text-[8px] mt-auto pt-2">
            SEE OWNER'S MANUAL FOR ADDITIONAL INFORMATION
          </div>
        </div>
      );
    }

    if (template === 'multi_axle_heavy_duty') {
      const heavyDutyContainerClass =
        'bg-white text-black font-mono flex flex-col w-[450px] min-h-[300px] border-2 border-black text-[10px] leading-tight';

      // Find all GAWR axle keys from data and sort them numerically
      const gawrKeys = Object.keys(data)
        .filter((key) => key.startsWith('GAWR_AXLE_'))
        .sort((a, b) => {
          const numA = parseInt(a.split('_')[2], 10);
          const numB = parseInt(b.split('_')[2], 10);
          return numA - numB;
        });

      return (
        <div ref={ref} className={heavyDutyContainerClass}>
          <div className="flex-grow flex flex-col">
            <LabelRow label="MANUFACTURER" value={data['MANUFACTURER']} />
            <LabelRow label="DATE OF MFG" value={data['DATE_OF_MFG']} />
            <LabelRow label="GVWR" value={data['GVWR']} valueClass="font-bold" />

            {gawrKeys.map((key) => (
              <LabelRow
                key={key}
                label={`GAWR AXLE ${key.split('_')[2]}`}
                value={data[key]}
                valueClass="font-bold"
              />
            ))}

            <div className="flex border-b border-black">
              <div className="w-1/3 border-r border-black p-1 font-bold text-xs flex flex-col justify-center">
                <span>TIRE & RIM</span>
              </div>
              <div className="w-2/3 p-1 text-xs font-semibold">
                <div>TIRES: {data['TIRES']}</div>
                <div>RIMS: {data['RIMS']}</div>
              </div>
            </div>
            <LabelRow label="COLD INFL. PRESS." value={data['COLD_INFL_PRESS']} />

            <div className="flex-grow flex items-center justify-center border-y border-black">
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

    return null;
  }
);

VinLabel.displayName = 'VinLabel';
