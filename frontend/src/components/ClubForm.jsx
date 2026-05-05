import { useState, useEffect } from "react";

export default function ClubForm({
  club = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    category: "General",
    description: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (club) {
      setFormData({
        name: club.name || "",
        category: club.category || "General",
        description: club.description || "",
      });
    }
  }, [club]);

  const categories = [
    "General",
    "Technology",
    "Engineering",
    "Public Speaking",
    "Arts",
    "Business",
    "Sports",
    "Community",
    "Culture",
    "Science",
    "Other",
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Club name is required";
    } else if (formData.name.trim().length > 80) {
      newErrors.name = "Club name must be 80 characters or less";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be 500 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="club-form">
      <div className="form-group">
        <label htmlFor="name">Club Name *</label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Programming Club"
          maxLength="80"
          required
          className={errors.name ? "input-error" : ""}
        />
        {errors.name && <span className="error-text">{errors.name}</span>}
        <small className="char-count">{formData.name.length}/80</small>
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Brief description of the club's purpose and activities"
          maxLength="500"
          rows="4"
          className={errors.description ? "input-error" : ""}
        />
        {errors.description && (
          <span className="error-text">{errors.description}</span>
        )}
        <small className="char-count">{formData.description.length}/500</small>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? "Saving..." : club ? "Update Club" : "Create Club"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
