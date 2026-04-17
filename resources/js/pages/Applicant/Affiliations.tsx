// resources/js/Pages/Applicant/Affiliations.tsx
import React, { useState, useCallback, useRef  } from "react";
import { useForm, router } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {route} from "ziggy-js"; 
import axios from "axios";
import '../../../css/easyApply.css';
import { Plus, Trash2, Save } from "lucide-react";

interface Affiliation {
  id?: number;
  institution: string;
  position: string;
}

interface AffiliationsProps {
  affiliations?: Affiliation[];
}

export default function Affiliations({ affiliations = [] }: AffiliationsProps) {
  
  const { data, setData, processing, errors } = useForm<{
    affiliations: Affiliation[];
  }>({
    affiliations: affiliations.length > 0 ? affiliations : [{ institution: "", position: "" }],
  });

  const [visibleCount, setVisibleCount] = useState(3);

  const saveAffiliation = async (affiliation: Affiliation, index: number) => {
    try{
      
      if (affiliation.id) {
        // Update existing
        const res = await axios.put(
          `/applicant/affiliations/${affiliation.id}`,
          affiliation
        );
        const updated = [...data.affiliations];
        updated[index] = res.data;
        setData("affiliations", updated);
      } else {
        // Create new
        const res = await axios.post(`/applicant/affiliations`, affiliation);
        const updated = [...data.affiliations];
        updated[index] = res.data; // replace temp with backend record
        setData("affiliations", updated);
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
  };
  
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleChange = (index: number, field: keyof Affiliation, value: string) => {
    const updated = [...data.affiliations];
    updated[index] = { ...updated[index], [field]: value };
    setData("affiliations", updated);

    if (updated[index].id) {
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      saveAffiliation(updated[index], index);
    }, 1000);
  }
  };

  // Add new affiliation
  const addAffiliation = () => {
     const newAffiliations = [
    ...data.affiliations,
    { institution: "", position: "" },
  ];
  setData("affiliations", newAffiliations);
    setVisibleCount(newAffiliations.length);
  };

  // Remove affiliation
  const removeAffiliation = async (id?: number, index?: number) => {
    if(id) {
      await axios.delete(`/applicant/affiliations/${id}`);
          setData(
            "affiliations",
            data.affiliations.filter((a) => a.id !== id)
          );

    } else if (index !== undefined) {
      setData(
        "affiliations",
        data.affiliations.filter((_, i) => i !== index)
      );
    }
  };

  return (
          <div className="space-y-4">
      {data.affiliations.slice(0, visibleCount).map((affiliation, index) => (
        <div
          key={affiliation.id ?? index}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Affiliation {index + 1}
            </h3>
            <div className="flex gap-2">
              {/* Show Save button only for NEW affiliations */}
              {!affiliation.id && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => saveAffiliation(affiliation, index)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              )}
            {data.affiliations.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeAffiliation(affiliation.id, index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
        </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Institution *</label>
              <Input
                value={affiliation.institution ?? ""}
                onChange={(e) => handleChange(index, "institution", e.target.value)}
                placeholder="e.g., Philippine Medical Association"
                required
              />
              {errors[`affiliations.${index}.institution`] && (
                <p className="text-red-600 text-sm mt-1">
                  {errors[`affiliations.${index}.institution`]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Position *</label>
              <Input
                value={affiliation.position ?? ""}
                onChange={(e) => handleChange(index, "position", e.target.value)}
                placeholder="e.g., Board Member, Secretary"
                required
              />
              {errors[`affiliations.${index}.position`] && (
                <p className="text-red-600 text-sm mt-1">
                  {errors[`affiliations.${index}.position`]}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {data.affiliations.length > 3 && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setVisibleCount(
                visibleCount === 3 ? data.affiliations.length : 3
              )
            }
          >
            {visibleCount === 3 ? "Show More" : "Show Less"}
          </Button>
        </div>
      )}

          {/* Add Affiliation Button */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={addAffiliation}
              className="flex items-center gap-2 border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Plus className="h-4 w-4" />
              Add Another Affiliation
            </Button>
          </div>

      </div>
  );
}