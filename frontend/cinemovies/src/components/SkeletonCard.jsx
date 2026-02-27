function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const score = index + 1;
        return (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`text-2xl ${score <= value ? 'text-amber-400' : 'text-slate-500'}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export default StarRating;