import { Pill } from "@/components/ui/pill";
import { RestrictionGroup, RestrictionRule } from "@/lib/courseRestrictions";

interface RestrictionsDisplayProps {
  restrictions: RestrictionGroup;
  className?: string;
}

export const RestrictionsDisplay = ({ restrictions, className = "" }: RestrictionsDisplayProps) => {
  const hasRestrictions =
    (restrictions.restrictions?.length ?? 0) > 0 || (restrictions.groups?.length ?? 0) > 0;

  if (!hasRestrictions) {
    return (
      <div className={`w-full py-6 ${className}`}>
        <div className="text-muted-foreground flex items-center gap-3">
          <div className="bg-green-light text-green border-green/20 flex-shrink-0 rounded-lg border p-2">
            <span className="text-sm font-medium">Sin restricciones específicas</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden py-6 ${className}`}>
      <RestrictionGroupComponent group={restrictions} />
    </div>
  );
};

interface RestrictionGroupComponentProps {
  group: RestrictionGroup;
  isNested?: boolean;
}

const RestrictionGroupComponent = ({ group, isNested = false }: RestrictionGroupComponentProps) => {
  const groupLabel =
    group.type === "AND"
      ? "Debes cumplir todas las restricciones de este grupo"
      : "Debes cumplir al menos una de las restricciones de este grupo";

  const renderRestriction = (restriction: RestrictionRule, index: number) => {
    return (
      <div
        key={`restriction-${index}`}
        className="flex w-full items-center gap-3 rounded-lg border border-border bg-accent px-3 py-2"
      >
        <Pill variant="red" size="sm" className="flex-shrink-0">
          {restriction.type}
        </Pill>
        <div className="min-w-0 flex-1">
          <p className="text-foreground text-sm font-medium">{restriction.raw}</p>
        </div>
      </div>
    );
  };

  const renderGroup = (subGroup: RestrictionGroup, index: number) => (
    <div
      key={`group-${index}`}
      className="border-border bg-muted/30 my-2 w-full overflow-hidden rounded-lg border px-2 py-4"
    >
      <RestrictionGroupComponent group={subGroup} isNested={true} />
    </div>
  );

  const restrictionRules = group.restrictions || [];
  const groups = group.groups || [];
  const allItems = [...restrictionRules, ...groups];

  const renderSeparatorPill = (separatorType: "AND" | "OR") => {
    const separatorText = separatorType === "AND" ? "Y" : "O";

    return (
      <div className="flex justify-center py-2">
        <div
          className={`rounded-full border px-3 py-1 text-xs font-bold ${
            separatorType === "AND"
              ? "bg-blue-light text-blue border-blue/20"
              : "bg-green-light text-green border-green/20"
          }`}
        >
          {separatorText}
        </div>
      </div>
    );
  };

  const hasMultipleItems = allItems.length > 1;

  return (
    <div className={`w-full overflow-hidden ${isNested ? "space-y-2" : "space-y-3"}`}>
      {/* Group header for nested groups */}
      {isNested && hasMultipleItems && (
        <div className="border-border flex w-full items-center gap-3 border-b px-2 pb-3">
          <div
            className={`h-2 w-2 flex-shrink-0 rounded-full ${group.type === "AND" ? "bg-primary" : "bg-green"}`}
          ></div>
          <span className={`text-muted-foreground min-w-0 flex-1 text-sm font-semibold`}>
            {groupLabel}
          </span>
        </div>
      )}

      {/* Render restrictions and groups with separators */}
      <div className="w-full space-y-1">
        {allItems.map((item, index) => {
          const isGroup = "groups" in item;
          const isLast = index === allItems.length - 1;

          return (
            <div key={`item-${index}`} className="w-full">
              {isGroup
                ? renderGroup(item as RestrictionGroup, index)
                : renderRestriction(item as RestrictionRule, index)}
              {!isNested && !isLast && renderSeparatorPill(group.type)}
            </div>
          );
        })}
      </div>
    </div>
  );
};
