import { FaSpinner } from 'react-icons/fa';

export interface ComplaintFormValues {
  title: string;
  description: string;
  category: string;
  priority: string;
  student?: string;
  room?: string;
}

interface ComplaintFormProps {
  values: ComplaintFormValues;
  onChange: (next: ComplaintFormValues) => void;
  onSubmit: (event: React.FormEvent) => void;
  errors?: Partial<Record<keyof ComplaintFormValues, string>>;
  submitDisabled?: boolean;
  onCancel?: () => void;
  submitLabel?: string;
  loading?: boolean;
  includeStudentRoom?: boolean;
}

const categories = ['Maintenance', 'IT Support', 'Plumbing', 'Electrical', 'Housekeeping'];
const priorities = ['Low', 'Medium', 'High'];

const inputClass =
  'h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25';
const labelClass = 'mb-2 block text-sm font-semibold text-gray-700';

const ComplaintForm = ({
  values,
  onChange,
  onSubmit,
  errors = {},
  submitDisabled = false,
  onCancel,
  submitLabel = 'Submit Complaint',
  loading = false,
  includeStudentRoom = false,
}: ComplaintFormProps) => {
  const update = (field: keyof ComplaintFormValues, value: string) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {includeStudentRoom && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="complaint-student">
              Student
            </label>
            <input
              id="complaint-student"
              value={values.student || ''}
              onChange={(e) => update('student', e.target.value)}
              className={`${inputClass} ${errors.student ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
              required
              placeholder="Student ID or name"
            />
            {errors.student && <p className="mt-1 text-xs font-medium text-red-600">{errors.student}</p>}
          </div>
          <div>
            <label className={labelClass} htmlFor="complaint-room">
              Room
            </label>
            <input
              id="complaint-room"
              value={values.room || ''}
              onChange={(e) => update('room', e.target.value)}
              className={`${inputClass} ${errors.room ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
              required
              placeholder="Room number"
            />
            {errors.room && <p className="mt-1 text-xs font-medium text-red-600">{errors.room}</p>}
          </div>
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor="complaint-title">
          Complaint Title
        </label>
        <input
          id="complaint-title"
          value={values.title}
          onChange={(e) => update('title', e.target.value)}
          className={`${inputClass} ${errors.title ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
          required
          maxLength={120}
          placeholder="Briefly describe the issue"
        />
        {errors.title && <p className="mt-1 text-xs font-medium text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="complaint-description">
          Description
        </label>
        <textarea
          id="complaint-description"
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
          className={`min-h-[120px] w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-2 ${
            errors.description
              ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
              : 'border-gray-200 focus:border-primary focus:ring-primary/25'
          }`}
          required
          maxLength={1200}
          placeholder="Share enough detail so the maintenance team can act quickly"
        />
        {errors.description && <p className="mt-1 text-xs font-medium text-red-600">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="complaint-category">
            Category
          </label>
          <select
            id="complaint-category"
            value={values.category}
            onChange={(e) => update('category', e.target.value)}
            className={`${inputClass} ${errors.category ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-xs font-medium text-red-600">{errors.category}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="complaint-priority">
            Priority
          </label>
          <select
            id="complaint-priority"
            value={values.priority}
            onChange={(e) => update('priority', e.target.value)}
            className={`${inputClass} ${errors.priority ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          {errors.priority && <p className="mt-1 text-xs font-medium text-red-600">{errors.priority}</p>}
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || submitDisabled}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-accent px-5 text-sm font-semibold text-white shadow-sm transition hover:from-primary-hover hover:to-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <FaSpinner className="mr-2 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ComplaintForm;
