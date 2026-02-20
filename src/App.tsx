import React, { useState, useEffect, useRef, type DragEvent, type ChangeEvent, type MouseEvent } from 'react';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Type, 
  CheckSquare, 
  Heading, 
  Settings2, 
  Printer, 
  Columns as ColumnsIcon, 
  Square, 
  Image as ImageIcon, 
  Layout, 
  Table as TableIcon, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Database,
  Rows,
  PenTool,
  Paperclip,
  Grid,
  Maximize,
  CircleDot
} from 'lucide-react';

// --- TYPES & INTERFACES ---

type FieldType = 'text' | 'table' | 'array' | 'image';

interface FormField {
  id: string;
  label: string;
  value?: string | string[] | any[];
  type: FieldType;
  columns?: string[];
}

type ElementType = 
  | 'MAIN_HEADER' 
  | 'TITLE' 
  | 'SECTION_HEADER' 
  | 'SINGLE_ROW' 
  | 'ROW' 
  | 'SIGNATURE' 
  | 'TABLE' 
  | 'CHECKBOX_GROUP' 
  | 'RADIO_GROUP'
  | 'TEXT_AREA' 
  | 'ATTACHMENT'
  | 'FOUR_FIELD_GRID';

interface TemplateElement {
  id: string;
  type: ElementType;
  props: Record<string, any>;
}

interface ComponentConfig {
  type: ElementType;
  label: string;
  icon: React.ReactNode;
  defaultProps: Record<string, any>;
}

// --- MOCK DATA ---
const FORM_DATA_FIELDS: FormField[] = [
  { id: 'none', label: '-- No Link (Static) --', type: 'text' },
  { id: 'employee_name', label: 'Employee Name', value: 'John Doe', type: 'text' },
  { id: 'employee_service', label: 'Length of Service', value: '5 Years', type: 'text' },
  { id: 'supervisor_name', label: 'Supervisor Name', value: 'Jane Smith', type: 'text' },
  { id: 'incident_date', label: 'Date of Occurrence', value: '2024-05-15', type: 'text' },
  { id: 'location', label: 'Site / Location', value: 'Refinery Sector A', type: 'text' },
  { id: 'witness_table', label: 'Witness Information Table', type: 'table', 
    columns: ['Name', 'Contact', 'Statement'],
    value: [
      { Name: 'Robert Miller', Contact: '555-0101', Statement: 'Heard a loud bang near the valve.' },
      { Name: 'Sarah Connor', Contact: '555-0102', Statement: 'Saw steam escaping from the seal.' }
    ] 
  },
  { id: 'classification', label: 'Incident Classification', value: ['First Aid', 'Equipment Damage'], type: 'array' },
  { id: 'incident_desc', label: 'Incident Description', value: 'Minor equipment failure during routine pressure check.', type: 'text' },
  { id: 'employee_sig', label: 'Employee Digital Signature', value: 'John Doe (E-Signed 2024-05-15)', type: 'text' },
  { id: 'incident_photo', label: 'Incident Photo', value: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=400', type: 'image' }
];

// --- MODULAR REACT TEMPLATE COMPONENTS ---

const LinkBadge = ({ mapping }: { mapping: string }) => (
  mapping !== 'none' ? <span className="tp-link">[{mapping}]</span> : null
);

const TemplateMainHeader = ({ companyName, reportTitle, docId, logoUrl }: any) => (
  <div className="tp-main-header">
    <div className="tp-main-header__content">
      <h2 className="tp-main-header__company">{companyName}</h2>
      <p className="tp-main-header__report">{reportTitle}</p>
      <p className="tp-main-header__doc-id">{docId}</p>
    </div>
    <div className="tp-main-header__logo-wrapper">
      {logoUrl ? (
        <img src={logoUrl} alt="Logo" className="tp-main-header__logo" />
      ) : (
        <div className="tp-main-header__logo-placeholder">Logo Area</div>
      )}
    </div>
  </div>
);

const TemplateTitle = ({ companyName, reportTitle, docId, isFlush }: any) => (
  <div className={`tp-title ${isFlush ? 'is-flush' : ''}`}>
    <h2 className="tp-title__company">{companyName}</h2>
    <p className="tp-title__report">{reportTitle}</p>
    <p className="tp-title__doc-id">{docId}</p>
  </div>
);

const TemplateSectionHeader = ({ text, bgColor, textColor }: any) => (
  <div className="tp-section-header" style={{ backgroundColor: bgColor, color: textColor }}>
    {text}
  </div>
);

const TemplateSingleRow = ({ label, mapping, value, isFlush, hideLabel, useCustomHeight, customHeight, labelAsHeader, labelPosition, headerBgColor, headerTextColor }: any) => {
  const valueStyle = useCustomHeight ? { minHeight: `${customHeight}px` } : {};
  const colClass = `tp-row__col ${labelPosition === 'stacked' ? 'is-stacked' : ''}`;
  const labelClass = `tp-row__label ${labelAsHeader ? 'is-header' : ''}`;
  const labelStyle = labelAsHeader ? { backgroundColor: headerBgColor || '#000000', color: headerTextColor || '#ffffff' } : {};

  return (
    <div className={`tp-row ${isFlush ? 'is-flush' : ''}`}>
      <div className={colClass}>
        {!hideLabel && <div className={labelClass} style={labelStyle}>{label}{labelAsHeader ? '' : ':'}</div>}
        <div className="tp-row__value" style={valueStyle}>
          {value || <LinkBadge mapping={mapping} />}
        </div>
      </div>
    </div>
  );
};

const TemplateRow = ({ leftLabel, leftMapping, leftValue, rightLabel, rightMapping, rightValue, isFlush, hideLeftLabel, hideRightLabel, useCustomHeight, customHeight, labelAsHeader, labelPosition, headerBgColor, headerTextColor }: any) => {
  const valueStyle = useCustomHeight ? { minHeight: `${customHeight}px` } : {};
  const colClass = `tp-row__col ${labelPosition === 'stacked' ? 'is-stacked' : ''}`;
  const labelClass = `tp-row__label ${labelAsHeader ? 'is-header' : ''}`;
  const labelStyle = labelAsHeader ? { backgroundColor: headerBgColor || '#000000', color: headerTextColor || '#ffffff' } : {};

  return (
    <div className={`tp-row ${isFlush ? 'is-flush' : ''}`}>
      <div className={colClass}>
        {!hideLeftLabel && <div className={labelClass} style={labelStyle}>{leftLabel}{labelAsHeader ? '' : ':'}</div>}
        <div className="tp-row__value" style={valueStyle}>
          {leftValue || <LinkBadge mapping={leftMapping} />}
        </div>
      </div>
      <div className={colClass}>
        {!hideRightLabel && <div className={labelClass} style={labelStyle}>{rightLabel}{labelAsHeader ? '' : ':'}</div>}
        <div className="tp-row__value" style={valueStyle}>
          {rightValue || <LinkBadge mapping={rightMapping} />}
        </div>
      </div>
    </div>
  );
};

const TemplateFourFieldGrid = ({ f1Label, f1Mapping, f1Value, hideF1Label, f2Label, f2Mapping, f2Value, hideF2Label, f3Label, f3Mapping, f3Value, hideF3Label, f4Label, f4Mapping, f4Value, hideF4Label, isFlush, useCustomHeight, customHeight, labelAsHeader, labelPosition, headerBgColor, headerTextColor }: any) => {
  const valueStyle = useCustomHeight ? { minHeight: `${customHeight}px` } : {};
  const colClass = `tp-row__col ${labelPosition === 'stacked' ? 'is-stacked' : ''}`;
  const labelClass = `tp-row__label ${labelAsHeader ? 'is-header' : ''}`;
  const labelStyle = labelAsHeader ? { backgroundColor: headerBgColor || '#000000', color: headerTextColor || '#ffffff' } : {};

  return (
    <div className={`tp-row tp-row--4col ${isFlush ? 'is-flush' : ''}`}>
      <div className={colClass}>
        {!hideF1Label && <div className={labelClass} style={labelStyle}>{f1Label}{labelAsHeader ? '' : ':'}</div>}
        <div className="tp-row__value" style={valueStyle}>
          {f1Value || <LinkBadge mapping={f1Mapping} />}
        </div>
      </div>
      <div className={colClass}>
        {!hideF2Label && <div className={labelClass} style={labelStyle}>{f2Label}{labelAsHeader ? '' : ':'}</div>}
        <div className="tp-row__value" style={valueStyle}>
          {f2Value || <LinkBadge mapping={f2Mapping} />}
        </div>
      </div>
      <div className={colClass}>
        {!hideF3Label && <div className={labelClass} style={labelStyle}>{f3Label}{labelAsHeader ? '' : ':'}</div>}
        <div className="tp-row__value" style={valueStyle}>
          {f3Value || <LinkBadge mapping={f3Mapping} />}
        </div>
      </div>
      <div className={colClass}>
        {!hideF4Label && <div className={labelClass} style={labelStyle}>{f4Label}{labelAsHeader ? '' : ':'}</div>}
        <div className="tp-row__value" style={valueStyle}>
          {f4Value || <LinkBadge mapping={f4Mapping} />}
        </div>
      </div>
    </div>
  );
};

const TemplateSignature = ({ label, mapping, value, isPreview, hideLabel }: any) => (
  <div className="tp-row is-flush">
    <div className="tp-row__col">
      {!hideLabel && <div className="tp-row__label">{label}:</div>}
      <div className="tp-row__value tp-row__value--signature">
        {isPreview ? (
          <span className="tp-signature-text">{value || " "}</span>
        ) : (
          <div className="tp-signature-line">
            <span className="tp-signature-placeholder">Signatory Line</span>
            <LinkBadge mapping={mapping} />
          </div>
        )}
      </div>
    </div>
  </div>
);

const TemplateTable = ({ columns, sourceTable, staticRowCount, isPreview, isFlush, hideHeaders }: any) => {
  const displayRows = (isPreview && sourceTable && Array.isArray(sourceTable.value)) ? sourceTable.value : Array.from({ length: staticRowCount });
  return (
    <div className={`tp-table ${isFlush ? 'is-flush' : ''}`}>
      {!hideHeaders && (
        <div className="tp-table__header">
          {columns.map((col: any, i: number) => (
            <div key={i} className="tp-table__th">{col.label}</div>
          ))}
        </div>
      )}
      {displayRows.map((rowData: any, rowIndex: number) => (
        <div key={rowIndex} className="tp-table__row">
          {columns.map((col: any, colIndex: number) => (
            <div key={colIndex} className="tp-table__td">
              {isPreview && sourceTable ? rowData[col.sourceField] : ''}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const TemplateSelectionGroup = ({ title, options, columns, mapping, checkedValues, inputType, isPreview, isFlush, hideLabel, hideTitle, labelAsHeader, labelPosition, headerBgColor, headerTextColor }: any) => {
  const isHidden = hideLabel || hideTitle;
  
  const colClass = `tp-row__col ${labelPosition === 'stacked' ? 'is-stacked' : ''}`;
  const labelClass = `tp-row__label ${labelAsHeader ? 'is-header' : ''}`;
  const labelStyle = labelAsHeader ? { backgroundColor: headerBgColor || '#000000', color: headerTextColor || '#ffffff' } : {};

  return (
    <div className={`tp-row ${isFlush ? 'is-flush' : ''}`}>
      <div className={colClass} style={{ flex: 1 }}>
        {!isHidden && <div className={labelClass} style={labelStyle}>{title}{labelAsHeader ? '' : ':'}</div>}
        <div className="tp-row__value" style={{ display: 'block', width: '100%', padding: '0.75rem' }}>
          <div className="tp-checkbox-group__grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, display: 'grid', gap: '0.5rem' }}>
            {options.map((opt: string, i: number) => {
              const isChecked = isPreview && Array.isArray(checkedValues) && checkedValues.includes(opt);
              return (
                <div key={i} className="tp-checkbox-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type={inputType} 
                    checked={isChecked || false} 
                    readOnly 
                    className="tp-native-input"
                  />
                  <span className="tp-checkbox-label" style={{ fontSize: '9px', textTransform: 'uppercase', color: '#334155' }}>{opt}</span>
                </div>
              );
            })}
          </div>
          {!isPreview && <div style={{marginTop: '4px'}}><LinkBadge mapping={mapping} /></div>}
        </div>
      </div>
    </div>
  );
};

const TemplateTextArea = ({ label, mapping, value, isPreview, isFlush, hideLabel, useCustomHeight, customHeight }: any) => {
  const contentStyle = useCustomHeight ? { minHeight: `${customHeight}px` } : {};
  return (
    <div className={`tp-text-area ${isFlush ? 'is-flush' : ''}`}>
      {(!hideLabel || !isPreview) && (
        <div className="tp-text-area__header" style={hideLabel ? { opacity: 0.5, backgroundColor: '#f8fafc', color: '#94a3b8' } : {}}>
          <span>{hideLabel ? `[Hidden] ${label}` : label}</span>
          {!isPreview && <LinkBadge mapping={mapping} />}
        </div>
      )}
      <div className="tp-text-area__content" style={contentStyle}>
        {isPreview ? value : ''}
      </div>
    </div>
  );
};

const TemplateAttachment = ({ label, mapping, value, useCustomSize, customWidth, customHeight, isPreview, isFlush, hideLabel }: any) => {
  const imgStyle: React.CSSProperties = useCustomSize 
    ? { width: `${customWidth}px`, height: `${customHeight}px`, objectFit: 'contain' }
    : { maxWidth: '100%', height: 'auto' };

  return (
    <div className={`tp-attachment ${isFlush ? 'is-flush' : ''}`}>
      {(!hideLabel || !isPreview) && (
        <div className="tp-attachment__header" style={hideLabel ? { opacity: 0.5, color: '#94a3b8' } : {}}>
          {hideLabel ? `[Hidden] ${label}` : label}:
        </div>
      )}
      <div className="tp-attachment__content">
        {isPreview ? (
          value ? (
            <img src={value} alt={label} style={imgStyle} className="tp-attachment__image" />
          ) : (
            <span className="tp-attachment__placeholder-text">No image provided</span>
          )
        ) : (
          <div className={`tp-attachment__placeholder ${useCustomSize ? 'tp-attachment__placeholder--custom' : ''}`} style={useCustomSize ? { width: `${customWidth}px`, height: `${customHeight}px` } : {}}>
            <ImageIcon size={32} />
            <span className="tp-attachment__placeholder-text">Image Area</span>
            <LinkBadge mapping={mapping} />
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN BUILDER APP ---

const App: React.FC = () => {
  const [elements, setElements] = useState<TemplateElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<'builder' | 'preview'>('builder'); 
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedElement = elements.find(el => el.id === selectedId);

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const commonDefaults = { marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 };
  const labelDefaults = { labelAsHeader: false, labelPosition: 'inline', headerBgColor: '#000000', headerTextColor: '#ffffff' };

  const COMPONENT_TYPES: Record<ElementType, ComponentConfig> = {
    MAIN_HEADER: { type: 'MAIN_HEADER', label: 'Logo & Title Header', icon: <Layout size={18} />, defaultProps: { ...commonDefaults, companyName: 'TIMEC Oil & Gas, Inc.', reportTitle: 'Preliminary Incident Report', docId: 'TMF-8300-SA-0140', logoUrl: null } },
    TITLE: { type: 'TITLE', label: 'Title Header', icon: <Heading size={18} />, defaultProps: { ...commonDefaults, companyName: 'TIMEC Oil & Gas, Inc.', reportTitle: 'Preliminary Incident Report', docId: 'TMF-8300-SA-0140' } },
    SECTION_HEADER: { type: 'SECTION_HEADER', label: 'Section Header', icon: <Square size={18} fill="currentColor" color="#4f46e5" />, defaultProps: { ...commonDefaults, text: 'SECTION TITLE', bgColor: '#004a99', textColor: '#ffffff' } },
    SINGLE_ROW: { type: 'SINGLE_ROW', label: 'Single column(100)', icon: <Rows size={18} />, defaultProps: { ...commonDefaults, ...labelDefaults, label: 'Field Name', mapping: 'none', hideLabel: false, useCustomHeight: false, customHeight: 50 } },
    ROW: { type: 'ROW', label: 'Two Column Row', icon: <ColumnsIcon size={18} />, defaultProps: { ...commonDefaults, ...labelDefaults, leftLabel: 'Field 1', leftMapping: 'none', hideLeftLabel: false, rightLabel: 'Field 2', rightMapping: 'none', hideRightLabel: false, useCustomHeight: false, customHeight: 50 } },
    FOUR_FIELD_GRID: { type: 'FOUR_FIELD_GRID', label: '25% column', icon: <Grid size={18} />, defaultProps: { ...commonDefaults, ...labelDefaults, f1Label: 'Field 1', f1Mapping: 'none', hideF1Label: false, f2Label: 'Field 2', f2Mapping: 'none', hideF2Label: false, f3Label: 'Field 3', f3Mapping: 'none', hideF3Label: false, f4Label: 'Field 4', f4Mapping: 'none', hideF4Label: false, useCustomHeight: false, customHeight: 50 } },
    SIGNATURE: { type: 'SIGNATURE', label: 'Signature', icon: <PenTool size={18} />, defaultProps: { ...commonDefaults, label: 'Signature', mapping: 'none', hideLabel: false } },
    TABLE: { type: 'TABLE', label: 'Table plugin', icon: <TableIcon size={18} />, defaultProps: { ...commonDefaults, tableMapping: 'none', columns: [{ label: 'Column 1', sourceField: 'none' }], staticRowCount: 3, hideHeaders: false } },
    CHECKBOX_GROUP: { type: 'CHECKBOX_GROUP', label: 'Checkbox Group', icon: <CheckSquare size={18} />, defaultProps: { ...commonDefaults, ...labelDefaults, labelPosition: 'stacked', title: 'Checkboxes', options: ['Option 1'], columns: 1, mapping: 'none', hideLabel: false } },
    RADIO_GROUP: { type: 'RADIO_GROUP', label: 'Radio Group', icon: <CircleDot size={18} />, defaultProps: { ...commonDefaults, ...labelDefaults, labelPosition: 'stacked', title: 'Radio Selection', options: ['Option 1'], columns: 1, mapping: 'none', hideLabel: false } },
    TEXT_AREA: { type: 'TEXT_AREA', label: 'Large Text Box', icon: <Type size={18} />, defaultProps: { ...commonDefaults, label: 'Description', placeholder: 'Enter details...', mapping: 'none', hideLabel: false, useCustomHeight: false, customHeight: 120 } },
    ATTACHMENT: { type: 'ATTACHMENT', label: 'Attachment', icon: <Paperclip size={18} />, defaultProps: { ...commonDefaults, label: 'Attachment', mapping: 'none', useCustomSize: false, customWidth: 200, customHeight: 200, hideLabel: false } },
  };

  const addElement = (type: ElementType) => {
    const newElement: TemplateElement = { id: generateId(), type: type, props: JSON.parse(JSON.stringify(COMPONENT_TYPES[type].defaultProps)) };
    setElements([...elements, newElement]);
    setSelectedId(newElement.id);
  };

  const updateElementProps = (id: string, newProps: Record<string, any>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, props: { ...el.props, ...newProps } } : el));
  };

  const removeElement = (id: string) => { setElements(prev => prev.filter(el => el.id !== id)); if (selectedId === id) setSelectedId(null); };
  const moveElement = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= elements.length) return;
    const newElements = [...elements];
    const temp = newElements[index];
    newElements[index] = newElements[newIndex];
    newElements[newIndex] = temp;
    setElements(newElements);
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newElements = [...elements];
    const itemToMove = newElements[draggedIndex];
    newElements.splice(draggedIndex, 1);
    newElements.splice(index, 0, itemToMove);
    setElements(newElements);
    setDraggedIndex(index);
  };
  const handleDragEnd = () => setDraggedIndex(null);

  const getMappedValue = (fieldId: string): any => { const field = FORM_DATA_FIELDS.find(f => f.id === fieldId); return field ? field.value : ''; };
  const getTableData = (fieldId: string): FormField | null => { const field = FORM_DATA_FIELDS.find(f => f.id === fieldId); return field && field.type === 'table' ? field : null; };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedId) {
      const reader = new FileReader();
      reader.onloadend = () => updateElementProps(selectedId, { logoUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const handleAfterPrint = () => setView('builder');
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const handlePrint = () => { setSelectedId(null); setView('preview'); setTimeout(() => window.print(), 300); };

  const renderLabelAppearanceSettings = () => {
    if (!selectedElement) return null;
    const { labelAsHeader, headerBgColor = '#000000', headerTextColor = '#ffffff', labelPosition = 'inline' } = selectedElement.props;
    
    return (
      <div className="tp-form-group" style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--tp-border-light)'}}>
         <label className="tp-form-group__label" style={{marginBottom: '0.5rem'}}>Label Appearance</label>
         <label className="tp-checkbox-setting">
            <input type="checkbox" checked={labelAsHeader || false} onChange={(e) => updateElementProps(selectedElement.id, { labelAsHeader: e.target.checked })} />
            <span>Style Label as Header</span>
         </label>
         
         {labelAsHeader && (
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
             <div className="tp-form-group" style={{ marginBottom: 0 }}>
               <label className="tp-form-group__label">Header BG</label>
               <input type="color" className="tp-input" style={{ height: '36px', padding: '2px', width: '100%' }} value={headerBgColor} onChange={(e) => updateElementProps(selectedElement.id, { headerBgColor: e.target.value })} />
             </div>
             <div className="tp-form-group" style={{ marginBottom: 0 }}>
               <label className="tp-form-group__label">Text Color</label>
               <input type="color" className="tp-input" style={{ height: '36px', padding: '2px', width: '100%' }} value={headerTextColor} onChange={(e) => updateElementProps(selectedElement.id, { headerTextColor: e.target.value })} />
             </div>
           </div>
         )}

         <label className="tp-checkbox-setting" style={{marginTop: '0.75rem'}}>
            <input type="checkbox" checked={labelPosition === 'stacked'} onChange={(e) => updateElementProps(selectedElement.id, { labelPosition: e.target.checked ? 'stacked' : 'inline' })} />
            <span>Stack Label on Top</span>
         </label>
      </div>
    );
  };

  const RenderElement = ({ el, isPreview = false, isLastInSectionHeader = false }: { el: TemplateElement, isPreview?: boolean, isLastInSectionHeader?: boolean }) => {
    const props = { ...el.props, isPreview, isFlush: isLastInSectionHeader };
    
    switch (el.type) {
      case 'MAIN_HEADER': return <TemplateMainHeader {...props} />;
      case 'TITLE': return <TemplateTitle {...props} />;
      case 'SECTION_HEADER': return <TemplateSectionHeader {...props} />;
      case 'SINGLE_ROW': return <TemplateSingleRow {...props} value={getMappedValue(el.props.mapping)} mapping={el.props.mapping} />;
      case 'ROW': return <TemplateRow {...props} leftValue={getMappedValue(el.props.leftMapping)} leftMapping={el.props.leftMapping} rightValue={getMappedValue(el.props.rightMapping)} rightMapping={el.props.rightMapping} />;
      case 'FOUR_FIELD_GRID': return <TemplateFourFieldGrid {...props} f1Value={getMappedValue(el.props.f1Mapping)} f1Mapping={el.props.f1Mapping} f2Value={getMappedValue(el.props.f2Mapping)} f2Mapping={el.props.f2Mapping} f3Value={getMappedValue(el.props.f3Mapping)} f3Mapping={el.props.f3Mapping} f4Value={getMappedValue(el.props.f4Mapping)} f4Mapping={el.props.f4Mapping} />;
      case 'SIGNATURE': return <TemplateSignature {...props} value={getMappedValue(el.props.mapping)} mapping={el.props.mapping} />;
      case 'TABLE': return <TemplateTable {...props} sourceTable={getTableData(el.props.tableMapping)} />;
      case 'CHECKBOX_GROUP': return <TemplateSelectionGroup {...props} checkedValues={getMappedValue(el.props.mapping)} mapping={el.props.mapping} inputType="checkbox" />;
      case 'RADIO_GROUP': return <TemplateSelectionGroup {...props} checkedValues={getMappedValue(el.props.mapping)} mapping={el.props.mapping} inputType="radio" />;
      case 'TEXT_AREA': return <TemplateTextArea {...props} value={getMappedValue(el.props.mapping)} mapping={el.props.mapping} />;
      case 'ATTACHMENT': return <TemplateAttachment {...props} value={getMappedValue(el.props.mapping)} mapping={el.props.mapping} />;
      default: return null;
    }
  };

  const TemplateDisplay = ({ isPreview = false }) => (
    <>
      {elements.map((el, index) => {
        const isSelected = !isPreview && selectedId === el.id;
        const isFollowsSection = elements[index - 1]?.type === 'SECTION_HEADER';
        const wrapperStyle: React.CSSProperties = {
            marginTop: el.props.marginTop !== undefined ? `${el.props.marginTop}px` : undefined,
            marginBottom: el.props.marginBottom !== undefined ? `${el.props.marginBottom}px` : undefined,
            marginLeft: el.props.marginLeft !== undefined ? `${el.props.marginLeft}px` : undefined,
            marginRight: el.props.marginRight !== undefined ? `${el.props.marginRight}px` : undefined,
        };
        
        return (
          <div 
            key={el.id}
            draggable={!isPreview}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onClick={(e: MouseEvent<HTMLDivElement>) => { e.stopPropagation(); if (!isPreview) setSelectedId(el.id); }}
            style={wrapperStyle}
            className={`tp-element-wrapper ${isSelected ? 'is-selected' : ''} ${isFollowsSection ? 'is-flush' : ''} ${draggedIndex === index ? 'is-dragged' : ''} ${isPreview ? 'is-preview' : ''}`}
          >
            {isSelected && (
              <div className="tp-element-controls no-print">
                <button onClick={(e) => { e.stopPropagation(); moveElement(index, 'up'); }} disabled={index === 0} className="tp-element-controls__btn"><ChevronUp size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); moveElement(index, 'down'); }} disabled={index === elements.length - 1} className="tp-element-controls__btn"><ChevronDown size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); removeElement(el.id); }} className="tp-element-controls__btn tp-element-controls__btn--danger"><Trash2 size={14} /></button>
              </div>
            )}
            {!isSelected && !isPreview && <div className="tp-drag-handle no-print"><GripVertical size={20} /></div>}
            <RenderElement el={el} isPreview={isPreview} isLastInSectionHeader={isFollowsSection} />
          </div>
        );
      })}
    </>
  );

  return (
    <div className="tp-app">
      <style dangerouslySetInnerHTML={{ __html: `
        :root { --tp-primary: #4f46e5; --tp-primary-hover: #4338ca; --tp-primary-light: #eef2ff; --tp-primary-border: #c7d2fe; --tp-text-main: #0f172a; --tp-text-muted: #64748b; --tp-text-light: #94a3b8; --tp-bg-main: #f1f5f9; --tp-bg-surface: #ffffff; --tp-bg-surface-alt: #f8fafc; --tp-border: #e2e8f0; --tp-border-dark: #000000; --tp-border-light: #e2e8f0; --tp-danger: #ef4444; --tp-danger-bg: #fef2f2; }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; color: var(--tp-text-main); }
        .tp-app { display: flex; flex-direction: column; height: 100vh; background-color: var(--tp-bg-main); width: 100%; }
        .tp-header { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1.5rem; background-color: var(--tp-bg-surface); border-bottom: 1px solid var(--tp-border); box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); z-index: 10; }
        .tp-header__brand h1 { margin: 0; font-size: 1.125rem; font-weight: bold; color: var(--tp-primary); }
        .tp-header__tabs { display: flex; background-color: var(--tp-bg-main); padding: 0.25rem; border-radius: 0.5rem; border: 1px solid var(--tp-border); }
        .tp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer; border: none; font-family: inherit; transition: all 0.2s ease; }
        .tp-btn--tab { padding: 0.375rem 1.25rem; border-radius: 0.375rem; font-size: 0.875rem; font-weight: bold; background: transparent; color: var(--tp-text-muted); }
        .tp-btn--tab.is-active { background-color: var(--tp-bg-surface); color: var(--tp-primary); box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
        .tp-btn--primary { background-color: var(--tp-primary); color: #fff; padding: 0.5rem 1.5rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: bold; }
        .tp-main { display: flex; flex: 1; overflow: hidden; }
        .tp-sidebar { width: 280px; background-color: var(--tp-bg-surface); overflow-y: auto; padding: 1.5rem; flex-shrink: 0; }
        .tp-sidebar--left { border-right: 1px solid var(--tp-border); }
        .tp-sidebar--right { width: 320px; border-left: 1px solid var(--tp-border); }
        .tp-sidebar__title { font-size: 10px; font-weight: 900; color: var(--tp-text-light); text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem; }
        .tp-component-btn { width: 100%; display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; margin-bottom: 0.5rem; background-color: transparent; border: 1px solid transparent; border-radius: 0.75rem; cursor: pointer; text-align: left; }
        .tp-component-btn:hover { border-color: var(--tp-primary-border); background-color: var(--tp-primary-light); }
        .tp-component-btn__label { font-size: 0.75rem; font-weight: bold; color: var(--tp-text-muted); text-transform: uppercase; }
        .tp-workspace { flex: 1; padding: 2rem; overflow-y: auto; display: flex; justify-content: center; background-color: var(--tp-bg-main); }
        .tp-document { width: 210mm; min-height: 297mm; background-color: #fff; padding: 3rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid var(--tp-border); position: relative; }
        .tp-empty-state { height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 4px dashed var(--tp-border); border-radius: 1.5rem; color: var(--tp-text-light); text-align: center; }
        .tp-element-wrapper { position: relative; transition: all 0.2s; border-radius: 2px; }
        .tp-element-wrapper:hover:not(.is-preview) { box-shadow: 0 0 0 1px var(--tp-text-light); }
        .tp-element-wrapper.is-selected { box-shadow: 0 0 0 2px var(--tp-primary) !important; z-index: 20; }
        .tp-element-controls { position: absolute; top: -32px; right: 0; display: flex; background-color: #fff; border: 1px solid var(--tp-primary-border); border-radius: 4px; z-index: 30; }
        .tp-element-controls__btn { padding: 0.375rem; color: var(--tp-text-muted); border: none; background: transparent; cursor: pointer; border-right: 1px solid var(--tp-border); display: flex; align-items: center; }
        .tp-drag-handle { position: absolute; left: -28px; top: 50%; transform: translateY(-50%); opacity: 0; cursor: grab; color: var(--tp-border); z-index: 10; }
        .tp-element-wrapper:hover .tp-drag-handle { opacity: 1; }
        .tp-settings-panel { display: flex; flex-direction: column; gap: 1.5rem; }
        .tp-settings-group { background-color: var(--tp-primary-light); padding: 1rem; border-radius: 0.75rem; border: 1px solid var(--tp-primary-border); }
        .tp-form-group { margin-bottom: 0.75rem; }
        .tp-form-group__label { display: block; font-size: 9px; font-weight: bold; color: var(--tp-text-muted); text-transform: uppercase; margin-bottom: 0.25rem; }
        .tp-input, .tp-select { width: 100%; padding: 0.5rem; font-size: 0.75rem; border: 1px solid var(--tp-border); border-radius: 0.5rem; background-color: #fff; color: var(--tp-text-main); }
        .tp-upload-btn { width: 100%; padding: 0.625rem; background-color: var(--tp-bg-surface-alt); border: 1px solid var(--tp-border); border-radius: 0.5rem; font-size: 0.75rem; font-weight: bold; color: var(--tp-text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .tp-list-item { display: flex; gap: 0.25rem; margin-bottom: 0.5rem; }
        .tp-icon-btn { padding: 0.5rem; color: var(--tp-danger); background: transparent; border: none; cursor: pointer; }
        .tp-add-btn { width: 100%; padding: 0.625rem; background-color: var(--tp-primary-light); border: 1px dashed var(--tp-primary-border); border-radius: 0.5rem; font-size: 10px; font-weight: bold; color: var(--tp-primary); cursor: pointer; }
        .tp-link { color: var(--tp-primary); font-size: 10px; font-weight: bold; background-color: var(--tp-primary-light); padding: 0.125rem 0.375rem; border-radius: 9999px; border: 1px solid var(--tp-primary-border); }
        .tp-checkbox-setting { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 10px; font-weight: bold; color: var(--tp-text-muted); text-transform: uppercase; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--tp-text-light); border-radius: 10px; }

        /* Template Elements */
        .tp-main-header { display: flex; justify-content: space-between; border-bottom: 4px solid var(--tp-border-dark); padding-bottom: 1rem; }
        .tp-main-header__company { font-size: 1.5rem; font-weight: 900; text-transform: uppercase; margin: 0; }
        .tp-main-header__report { font-size: 0.875rem; font-weight: bold; color: var(--tp-text-muted); margin: 0; }
        .tp-main-header__doc-id { font-size: 10px; color: var(--tp-text-light); font-family: monospace; }
        .tp-main-header__logo { height: 4rem; object-fit: contain; }
        .tp-main-header__logo-placeholder { width: 8rem; height: 4rem; background-color: var(--tp-bg-surface-alt); border: 2px dashed var(--tp-border); display: flex; align-items: center; justify-content: center; font-size: 10px; color: var(--tp-text-light); text-transform: uppercase; font-weight: bold; }
        .tp-title { display: flex; flex-direction: column; border-bottom: 4px solid var(--tp-border-dark); padding-bottom: 1rem; }
        .tp-title.is-flush { border-top: none; }
        .tp-section-header { padding: 0.5rem 1rem; text-align: center; font-weight: bold; letter-spacing: 0.1em; font-size: 0.875rem; border: 1px solid var(--tp-border-dark); }
        
        .tp-row { display: flex; border: 1px solid var(--tp-border-dark); background-color: #fff; }
        .tp-row.is-flush { border-top: none; }
        .tp-row__col { flex: 1; display: flex; }
        .tp-row__col:not(.is-stacked) { border-right: 1px solid var(--tp-border-dark); }
        .tp-row__col:last-child { border-right: none; }
        .tp-row__label { background-color: var(--tp-bg-surface-alt); padding: 0.25rem 0.5rem; font-size: 9px; font-weight: bold; border-right: 1px solid var(--tp-border); display: flex; align-items: center; white-space: nowrap; flex: none; text-transform: uppercase; min-width: 112px; }
        .tp-row__value { flex: 1; padding: 0.25rem 0.5rem; min-height: 28px; font-size: 11px; display: flex; align-items: center; }
        
        /* Layout Modifiers (Stacked & Headers) */
        .tp-row__col.is-stacked { flex-direction: column; border-right: 1px solid var(--tp-border-dark); }
        .tp-row__col.is-stacked:last-child { border-right: none; }
        .tp-row__col.is-stacked .tp-row__label { border-right: none; border-bottom: 1px solid var(--tp-border); width: 100%; justify-content: flex-start; }
        .tp-row__col.is-stacked .tp-row__value { width: 100%; }
        .tp-row__label.is-header { justify-content: center; text-align: center; font-size: 10px; letter-spacing: 0.1em; }

        /* 4-Column Row Label Adjustment to prevent squeezing */
        .tp-row--4col .tp-row__label { min-width: 60px; }

        .tp-row__value--signature { min-height: 54px; align-items: flex-end; padding-bottom: 0.25rem; }
        .tp-signature-text { font-family: serif; font-style: italic; font-size: 1.125rem; border-bottom: 1px solid var(--tp-text-light); width: 100%; display: block; }
        .tp-signature-line { width: 100%; border-bottom: 1px dashed var(--tp-border); display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 0.25rem; }
        .tp-signature-placeholder { font-size: 9px; color: var(--tp-text-light); text-transform: uppercase; font-weight: bold; font-style: italic; }
        .tp-table { border: 1px solid var(--tp-border-dark); }
        .tp-table__header { display: flex; background-color: var(--tp-bg-surface-alt); border-bottom: 1px solid var(--tp-border-dark); }
        .tp-table__th { flex: 1; padding: 0.25rem; font-size: 9px; font-weight: 900; text-transform: uppercase; text-align: center; border-right: 1px solid var(--tp-border-dark); }
        .tp-table__th:last-child { border-right: none; }
        .tp-table__row { display: flex; border-bottom: 1px solid var(--tp-border); }
        .tp-table__row:last-child { border-bottom: none; }
        .tp-table__td { flex: 1; min-height: 24px; padding: 0.25rem; font-size: 10px; display: flex; align-items: center; justify-content: center; border-right: 1px solid var(--tp-border-dark); }
        .tp-table__td:last-child { border-right: none; }
        
        .tp-native-input { margin: 0; width: 14px; height: 14px; flex-shrink: 0; accent-color: var(--tp-border-dark); }
        .tp-checkbox-label { font-size: 9px; text-transform: uppercase; color: #334155; }
        
        .tp-text-area { border: 1px solid var(--tp-border-dark); }
        .tp-text-area__header { background-color: var(--tp-border-dark); color: #fff; font-size: 10px; font-weight: bold; padding: 0.375rem 0.75rem; text-transform: uppercase; display: flex; justify-content: space-between; align-items: center; letter-spacing: 0.1em; }
        .tp-text-area__content { padding: 1rem; min-height: 80px; font-size: 11px; }
        .tp-attachment { display: flex; flex-direction: column; border: 1px solid var(--tp-border-dark); }
        .tp-attachment__header { background-color: var(--tp-bg-surface-alt); padding: 0.25rem 0.5rem; font-size: 9px; font-weight: bold; border-bottom: 1px solid var(--tp-border); text-transform: uppercase; }
        .tp-attachment__content { display: flex; align-items: center; justify-content: center; padding: 0.5rem; min-height: 100px; }
        .tp-attachment__placeholder { display: flex; flex-direction: column; align-items: center; color: var(--tp-text-light); }

        @media print {
          @page { size: A4; margin: 15mm; }
          body { margin: 0; padding: 0; background: white !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
          .no-print, .tp-header, .tp-sidebar { display: none !important; }
          .tp-main { display: block !important; padding: 0 !important; margin: 0 !important; }
          .tp-workspace { padding: 0 !important; margin: 0 !important; display: block !important; height: auto !important; box-shadow: none !important; background: white !important; }
          .tp-document { width: 100% !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: none !important; display: block !important; }
          
          .tp-row, .tp-table, .tp-text-area, .tp-attachment, .tp-section-header, .tp-title, .tp-main-header { border-color: #000000 !important; border-width: 1pt !important; }
          .tp-row__col:not(.is-stacked) { border-right: 1pt solid #000000 !important; }
          .tp-row__col.is-stacked { border-right: 1pt solid #000000 !important; }
          .tp-row__col:last-child { border-right: none !important; }
          .tp-row__col.is-stacked .tp-row__label { border-right: none !important; border-bottom: 1pt solid #000000 !important; }
          
          .tp-row__label:not(.is-header) { background-color: #f8fafc !important; }
          .tp-table__header, .tp-attachment__header { background-color: #f8fafc !important; }
          .tp-table__th, .tp-table__td { border-right: 1pt solid #000000 !important; }
        }
      `}} />

      <header className="tp-header no-print">
        <div className="tp-header__brand"><h1>Dynamic Template Builder</h1></div>
        <div className="tp-header__tabs">
          <button onClick={() => setView('builder')} className={`tp-btn tp-btn--tab ${view === 'builder' ? 'is-active' : ''}`}>Builder</button>
          <button onClick={() => setView('preview')} className={`tp-btn tp-btn--tab ${view === 'preview' ? 'is-active' : ''}`}>Preview</button>
        </div>
        <div className="tp-header__actions"><button onClick={handlePrint} className="tp-btn tp-btn--primary"><Printer size={16} /> Print</button></div>
      </header>

      <main className="tp-main">
        {view === 'builder' && (
          <aside className="tp-sidebar tp-sidebar--left no-print">
            <h2 className="tp-sidebar__title">Elements</h2>
            <div>
              {(Object.keys(COMPONENT_TYPES) as ElementType[]).map((key) => (
                <button key={key} onClick={() => addElement(key)} className="tp-component-btn">
                  <span className="tp-component-btn__label" style={{display:'flex', gap:'8px', alignItems:'center'}}>{COMPONENT_TYPES[key].icon}{COMPONENT_TYPES[key].label}</span>
                </button>
              ))}
            </div>
          </aside>
        )}

        <section className="tp-workspace" onClick={() => setSelectedId(null)}>
          <div className="tp-document">
            {elements.length === 0 && view === 'builder' ? (
              <div className="tp-empty-state no-print"><Plus size={48} /><p className="tp-empty-state__text">Canvas is empty</p></div>
            ) : (
              <TemplateDisplay isPreview={view === 'preview'} />
            )}
          </div>
        </section>

        {view === 'builder' && (
          <aside className="tp-sidebar tp-sidebar--right no-print">
            <h2 className="tp-sidebar__title"><Settings2 size={12} /> Element Details</h2>
            {selectedElement ? (
              <div className="tp-settings-panel custom-scrollbar">
                <div className="tp-settings-group">
                   <h3 className="tp-settings-group__title"><Database size={14} /> Source Data Link</h3>
                   {selectedElement.type === 'TABLE' ? (
                      <div className="tp-form-group">
                        <select value={selectedElement.props.tableMapping} onChange={(e) => updateElementProps(selectedElement.id, { tableMapping: e.target.value })} className="tp-select">
                           <option value="none">-- Select Table --</option>
                           {FORM_DATA_FIELDS.filter(f => f.type === 'table').map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                        </select>
                      </div>
                   ) : selectedElement.type === 'ROW' ? (
                      <>
                        <div className="tp-form-group"><label className="tp-form-group__label">Left Col Source</label><select value={selectedElement.props.leftMapping} onChange={(e) => updateElementProps(selectedElement.id, { leftMapping: e.target.value })} className="tp-select">{FORM_DATA_FIELDS.filter(f => f.type !== 'table').map(f => <option key={f.id} value={f.id}>{f.label}</option>)}</select></div>
                        <div className="tp-form-group"><label className="tp-form-group__label">Right Col Source</label><select value={selectedElement.props.rightMapping} onChange={(e) => updateElementProps(selectedElement.id, { rightMapping: e.target.value })} className="tp-select">{FORM_DATA_FIELDS.filter(f => f.type !== 'table').map(f => <option key={f.id} value={f.id}>{f.label}</option>)}</select></div>
                      </>
                   ) : selectedElement.type === 'FOUR_FIELD_GRID' ? (
                      <div style={{fontSize:'9px', color:'var(--tp-primary)'}}>Manage mappings in Grid Properties below</div>
                   ) : (
                      <div className="tp-form-group"><select value={selectedElement.props.mapping} onChange={(e) => updateElementProps(selectedElement.id, { mapping: e.target.value })} className="tp-select">{FORM_DATA_FIELDS.filter(f => f.type !== 'table').map(f => <option key={f.id} value={f.id}>{f.label}</option>)}</select></div>
                   )}
                </div>

                <div className="tp-settings-group">
                  <h3 className="tp-settings-group__title"><Maximize size={14} /> Layout (Margin px)</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="tp-form-group"><label className="tp-form-group__label">Top</label><input type="number" className="tp-input" value={selectedElement.props.marginTop || 0} onChange={(e) => updateElementProps(selectedElement.id, { marginTop: parseInt(e.target.value) || 0 })} /></div>
                    <div className="tp-form-group"><label className="tp-form-group__label">Bottom</label><input type="number" className="tp-input" value={selectedElement.props.marginBottom || 0} onChange={(e) => updateElementProps(selectedElement.id, { marginBottom: parseInt(e.target.value) || 0 })} /></div>
                    <div className="tp-form-group"><label className="tp-form-group__label">Left</label><input type="number" className="tp-input" value={selectedElement.props.marginLeft || 0} onChange={(e) => updateElementProps(selectedElement.id, { marginLeft: parseInt(e.target.value) || 0 })} /></div>
                    <div className="tp-form-group"><label className="tp-form-group__label">Right</label><input type="number" className="tp-input" value={selectedElement.props.marginRight || 0} onChange={(e) => updateElementProps(selectedElement.id, { marginRight: parseInt(e.target.value) || 0 })} /></div>
                  </div>
                </div>

                <div className="tp-settings-panel">
                  {selectedElement.type === 'MAIN_HEADER' && (
                    <div className="tp-settings-group">
                      <h3 className="tp-settings-group__title">Header Properties</h3>
                      <div className="tp-form-group">
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
                        <button onClick={() => fileInputRef.current?.click()} className="tp-upload-btn"><ImageIcon size={14} /> Update Logo</button>
                      </div>
                      <div className="tp-form-group"><label className="tp-form-group__label">Company Name</label><input type="text" className="tp-input" value={selectedElement.props.companyName} onChange={(e) => updateElementProps(selectedElement.id, { companyName: e.target.value })} /></div>
                      <div className="tp-form-group"><label className="tp-form-group__label">Report Title</label><input type="text" className="tp-input" value={selectedElement.props.reportTitle} onChange={(e) => updateElementProps(selectedElement.id, { reportTitle: e.target.value })} /></div>
                      <div className="tp-form-group"><label className="tp-form-group__label">Doc ID</label><input type="text" className="tp-input" value={selectedElement.props.docId} onChange={(e) => updateElementProps(selectedElement.id, { docId: e.target.value })} /></div>
                    </div>
                  )}

                  {selectedElement.type === 'TITLE' && (
                    <div className="tp-settings-group">
                      <h3 className="tp-settings-group__title">Title Properties</h3>
                      <div className="tp-form-group"><label className="tp-form-group__label">Company Name</label><input type="text" className="tp-input" value={selectedElement.props.companyName} onChange={(e) => updateElementProps(selectedElement.id, { companyName: e.target.value })} /></div>
                      <div className="tp-form-group"><label className="tp-form-group__label">Report Title</label><input type="text" className="tp-input" value={selectedElement.props.reportTitle} onChange={(e) => updateElementProps(selectedElement.id, { reportTitle: e.target.value })} /></div>
                      <div className="tp-form-group"><label className="tp-form-group__label">Doc ID</label><input type="text" className="tp-input" value={selectedElement.props.docId} onChange={(e) => updateElementProps(selectedElement.id, { docId: e.target.value })} /></div>
                    </div>
                  )}

                  {(selectedElement.type === 'CHECKBOX_GROUP' || selectedElement.type === 'RADIO_GROUP') && (
                    <div className="tp-settings-group">
                      <h3 className="tp-settings-group__title">{selectedElement.type === 'CHECKBOX_GROUP' ? 'Checkbox' : 'Radio'} Config</h3>
                      <div className="tp-form-group">
                        <label className="tp-form-group__label">Group Title</label>
                        <input type="text" className="tp-input" value={selectedElement.props.title} onChange={(e) => updateElementProps(selectedElement.id, { title: e.target.value })} />
                        <label className="tp-checkbox-setting" style={{marginTop: '0.5rem'}}><input type="checkbox" checked={selectedElement.props.hideLabel || false} onChange={(e) => updateElementProps(selectedElement.id, { hideLabel: e.target.checked })} /><span>Hide Title</span></label>
                      </div>
                      
                      {renderLabelAppearanceSettings()}

                      <div className="tp-form-group"><label className="tp-form-group__label">Grid Columns</label><input type="number" min="1" max="4" className="tp-input" value={selectedElement.props.columns} onChange={(e) => updateElementProps(selectedElement.id, { columns: parseInt(e.target.value) || 1 })} /></div>
                      <hr className="tp-divider" />
                      <label className="tp-form-group__label">Options List</label>
                      {selectedElement.props.options.map((opt: string, idx: number) => (
                        <div key={idx} className="tp-list-item">
                          <input type="text" className="tp-input" value={opt} onChange={(e) => {
                              const newOptions = [...selectedElement.props.options];
                              newOptions[idx] = e.target.value;
                              updateElementProps(selectedElement.id, { options: newOptions });
                            }} />
                          <button onClick={() => updateElementProps(selectedElement.id, { options: selectedElement.props.options.filter((_: any, i: number) => i !== idx) })} className="tp-icon-btn"><Trash2 size={12} /></button>
                        </div>
                      ))}
                      <button onClick={() => updateElementProps(selectedElement.id, { options: [...selectedElement.props.options, `New Option ${selectedElement.props.options.length + 1}`] })} className="tp-add-btn">+ Add Selection Option</button>
                    </div>
                  )}

                  {selectedElement.type === 'FOUR_FIELD_GRID' && (
                    <div className="tp-settings-group">
                      <h3 className="tp-settings-group__title">Grid Properties</h3>
                      
                      <div className="tp-form-group" style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--tp-primary-border)' }}>
                        <label className="tp-checkbox-setting">
                          <input type="checkbox" checked={selectedElement.props.useCustomHeight || false} onChange={(e) => updateElementProps(selectedElement.id, { useCustomHeight: e.target.checked })} />
                          <span>Set Custom Height</span>
                        </label>
                        {selectedElement.props.useCustomHeight && (
                          <input type="number" placeholder="Height (px)" className="tp-input" style={{marginTop: '0.5rem'}} value={selectedElement.props.customHeight} onChange={(e) => updateElementProps(selectedElement.id, { customHeight: e.target.value })} />
                        )}
                        {renderLabelAppearanceSettings()}
                      </div>

                      {[1,2,3,4].map(num => (
                        <div key={num} style={{marginBottom:'1rem', paddingBottom:'0.5rem', borderBottom:'1px solid var(--tp-primary-border)'}}>
                           <div className="tp-form-group">
                             <label className="tp-form-group__label">Field {num} Label</label>
                             <input type="text" className="tp-input" value={selectedElement.props[`f${num}Label`]} onChange={(e) => updateElementProps(selectedElement.id, { [`f${num}Label`]: e.target.value })} />
                             <label className="tp-checkbox-setting" style={{marginTop: '0.5rem'}}><input type="checkbox" checked={selectedElement.props[`hideF${num}Label`] || false} onChange={(e) => updateElementProps(selectedElement.id, { [`hideF${num}Label`]: e.target.checked })} /><span>Hide Field {num} Label</span></label>
                           </div>
                           <div className="tp-form-group"><label className="tp-form-group__label">Field {num} Mapping</label><select value={selectedElement.props[`f${num}Mapping`]} onChange={(e) => updateElementProps(selectedElement.id, { [`f${num}Mapping`]: e.target.value })} className="tp-select">{FORM_DATA_FIELDS.filter(f => f.type !== 'table').map(f => <option key={f.id} value={f.id}>{f.label}</option>)}</select></div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedElement.type === 'TABLE' && (
                    <div className="tp-settings-group">
                      <h3 className="tp-settings-group__title">Table Configuration</h3>
                      <div className="tp-form-group">
                        <label className="tp-checkbox-setting" style={{marginBottom: '0.75rem'}}>
                          <input type="checkbox" checked={selectedElement.props.hideHeaders || false} onChange={(e) => updateElementProps(selectedElement.id, { hideHeaders: e.target.checked })} />
                          <span>Hide Table Headers</span>
                        </label>
                        <label className="tp-form-group__label">Table Columns</label>
                        {selectedElement.props.columns.map((col: any, idx: number) => {
                          const tableData = getTableData(selectedElement.props.tableMapping);
                          return (
                            <div key={idx} style={{ padding: '0.5rem', border: '1px solid var(--tp-primary-border)', borderRadius: '4px', marginBottom: '0.5rem', backgroundColor: '#fff' }}>
                              <div className="tp-list-item">
                                <input type="text" className="tp-input" placeholder="Col Name" value={col.label} onChange={(e) => {
                                  const newCols = [...selectedElement.props.columns];
                                  newCols[idx].label = e.target.value;
                                  updateElementProps(selectedElement.id, { columns: newCols });
                                }} />
                                <button onClick={() => updateElementProps(selectedElement.id, { columns: selectedElement.props.columns.filter((_: any, i: number) => i !== idx) })} className="tp-icon-btn"><Trash2 size={12} /></button>
                              </div>
                              <select value={col.sourceField} onChange={(e) => {
                                const newCols = [...selectedElement.props.columns];
                                const selectedValue = e.target.value;
                                newCols[idx].sourceField = selectedValue;
                                if (selectedValue !== 'none') {
                                  newCols[idx].label = selectedValue;
                                }
                                updateElementProps(selectedElement.id, { columns: newCols });
                              }} className="tp-select" style={{ marginTop: '0.25rem' }}>
                                <option value="none">-- Map Field --</option>
                                {tableData?.columns?.map((c: string) => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                          );
                        })}
                        <button onClick={() => updateElementProps(selectedElement.id, { columns: [...selectedElement.props.columns, { label: 'New Column', sourceField: 'none' }] })} className="tp-add-btn">+ Add Additional Column</button>
                      </div>
                      
                      {selectedElement.props.tableMapping === 'none' && (
                        <div className="tp-form-group">
                          <label className="tp-form-group__label">Static Row Count</label>
                          <input type="number" className="tp-input" value={selectedElement.props.staticRowCount} onChange={(e) => updateElementProps(selectedElement.id, { staticRowCount: parseInt(e.target.value) || 1 })} />
                        </div>
                      )}
                    </div>
                  )}

                  {selectedElement.type === 'SIGNATURE' && <div className="tp-settings-group"><h3 className="tp-settings-group__title">Signature Settings</h3><div className="tp-form-group"><label className="tp-form-group__label">Field Label</label><input type="text" className="tp-input" value={selectedElement.props.label} onChange={(e) => updateElementProps(selectedElement.id, { label: e.target.value })} /><label className="tp-checkbox-setting" style={{marginTop: '0.5rem'}}><input type="checkbox" checked={selectedElement.props.hideLabel || false} onChange={(e) => updateElementProps(selectedElement.id, { hideLabel: e.target.checked })} /><span>Hide Label</span></label></div></div>}
                  
                  {selectedElement.type === 'TEXT_AREA' && (
                    <div className="tp-settings-group">
                      <h3 className="tp-settings-group__title">Text Box Settings</h3>
                      <div className="tp-form-group">
                        <label className="tp-form-group__label">Box Heading</label>
                        <input type="text" className="tp-input" value={selectedElement.props.label} onChange={(e) => updateElementProps(selectedElement.id, { label: e.target.value })} />
                        <label className="tp-checkbox-setting" style={{marginTop: '0.5rem'}}><input type="checkbox" checked={selectedElement.props.hideLabel || false} onChange={(e) => updateElementProps(selectedElement.id, { hideLabel: e.target.checked })} /><span>Hide Header Label</span></label>
                      </div>
                      <div className="tp-form-group" style={{marginTop: '1rem'}}>
                         <label className="tp-checkbox-setting">
                            <input type="checkbox" checked={selectedElement.props.useCustomHeight || false} onChange={(e) => updateElementProps(selectedElement.id, { useCustomHeight: e.target.checked })} />
                            <span>Set Custom Height</span>
                         </label>
                         {selectedElement.props.useCustomHeight && (
                            <input type="number" placeholder="Height (px)" className="tp-input" style={{marginTop: '0.5rem'}} value={selectedElement.props.customHeight} onChange={(e) => updateElementProps(selectedElement.id, { customHeight: e.target.value })} />
                         )}
                      </div>
                    </div>
                  )}

                  {selectedElement.type === 'ATTACHMENT' && (
                    <div className="tp-settings-group">
                      <h3 className="tp-settings-group__title">Attachment Settings</h3>
                      <div className="tp-form-group">
                        <label className="tp-form-group__label">Field Label</label>
                        <input type="text" className="tp-input" value={selectedElement.props.label} onChange={(e) => updateElementProps(selectedElement.id, { label: e.target.value })} />
                        <label className="tp-checkbox-setting" style={{marginTop: '0.5rem'}}><input type="checkbox" checked={selectedElement.props.hideLabel || false} onChange={(e) => updateElementProps(selectedElement.id, { hideLabel: e.target.checked })} /><span>Hide Header Label</span></label>
                      </div>
                      <div className="tp-form-group"><label className="tp-checkbox-setting"><input type="checkbox" checked={selectedElement.props.useCustomSize || false} onChange={(e) => updateElementProps(selectedElement.id, { useCustomSize: e.target.checked })} /><span>Set Custom Size</span></label></div>{selectedElement.props.useCustomSize && <div style={{display: 'flex', gap: '4px'}}><input type="number" placeholder="W" className="tp-input" value={selectedElement.props.customWidth} onChange={(e) => updateElementProps(selectedElement.id, { customWidth: e.target.value })} /><input type="number" placeholder="H" className="tp-input" value={selectedElement.props.customHeight} onChange={(e) => updateElementProps(selectedElement.id, { customHeight: e.target.value })} /></div>}
                    </div>
                  )}

                  {selectedElement.type === 'SINGLE_ROW' && (
                    <div className="tp-settings-group">
                      <h3 className="tp-settings-group__title">Row Settings</h3>
                      <div className="tp-form-group">
                        <label className="tp-form-group__label">Label</label>
                        <input type="text" className="tp-input" value={selectedElement.props.label} onChange={(e) => updateElementProps(selectedElement.id, { label: e.target.value })} />
                        <label className="tp-checkbox-setting" style={{marginTop: '0.5rem'}}><input type="checkbox" checked={selectedElement.props.hideLabel || false} onChange={(e) => updateElementProps(selectedElement.id, { hideLabel: e.target.checked })} /><span>Hide Label</span></label>
                      </div>
                      
                      {renderLabelAppearanceSettings()}
                      
                      <div className="tp-form-group" style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--tp-border-light)'}}>
                         <label className="tp-checkbox-setting">
                            <input type="checkbox" checked={selectedElement.props.useCustomHeight || false} onChange={(e) => updateElementProps(selectedElement.id, { useCustomHeight: e.target.checked })} />
                            <span>Set Custom Height</span>
                         </label>
                         {selectedElement.props.useCustomHeight && (
                            <input type="number" placeholder="Height (px)" className="tp-input" style={{marginTop: '0.5rem'}} value={selectedElement.props.customHeight} onChange={(e) => updateElementProps(selectedElement.id, { customHeight: e.target.value })} />
                         )}
                      </div>
                    </div>
                  )}

                  {selectedElement.type === 'ROW' && (
                    <div className="tp-settings-group">
                      <h3 className="tp-settings-group__title">Row Settings</h3>
                      <div className="tp-form-group">
                        <label className="tp-form-group__label">Left Label</label>
                        <input type="text" className="tp-input" value={selectedElement.props.leftLabel} onChange={(e) => updateElementProps(selectedElement.id, { leftLabel: e.target.value })} />
                        <label className="tp-checkbox-setting" style={{marginTop: '0.5rem'}}><input type="checkbox" checked={selectedElement.props.hideLeftLabel || false} onChange={(e) => updateElementProps(selectedElement.id, { hideLeftLabel: e.target.checked })} /><span>Hide Left Label</span></label>
                      </div>
                      <div className="tp-form-group">
                        <label className="tp-form-group__label">Right Label</label>
                        <input type="text" className="tp-input" value={selectedElement.props.rightLabel} onChange={(e) => updateElementProps(selectedElement.id, { rightLabel: e.target.value })} />
                        <label className="tp-checkbox-setting" style={{marginTop: '0.5rem'}}><input type="checkbox" checked={selectedElement.props.hideRightLabel || false} onChange={(e) => updateElementProps(selectedElement.id, { hideRightLabel: e.target.checked })} /><span>Hide Right Label</span></label>
                      </div>
                      
                      {renderLabelAppearanceSettings()}

                      <div className="tp-form-group" style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--tp-border-light)'}}>
                         <label className="tp-checkbox-setting">
                            <input type="checkbox" checked={selectedElement.props.useCustomHeight || false} onChange={(e) => updateElementProps(selectedElement.id, { useCustomHeight: e.target.checked })} />
                            <span>Set Custom Height</span>
                         </label>
                         {selectedElement.props.useCustomHeight && (
                            <input type="number" placeholder="Height (px)" className="tp-input" style={{marginTop: '0.5rem'}} value={selectedElement.props.customHeight} onChange={(e) => updateElementProps(selectedElement.id, { customHeight: e.target.value })} />
                         )}
                      </div>
                    </div>
                  )}
                  {selectedElement.type === 'SECTION_HEADER' && <div className="tp-form-group"><label className="tp-form-group__label">Title</label><input type="text" className="tp-input" value={selectedElement.props.text} onChange={(e) => updateElementProps(selectedElement.id, { text: e.target.value })} /></div>}
                </div>
              </div>
            ) : (
              <div className="tp-empty-selection no-print"><Database size={28} /><p>Select element on canvas</p></div>
            )}
          </aside>
        )}
      </main>
    </div>
  );
};

export default App;