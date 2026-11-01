import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import {
  UtensilsCrossed,
  Plus,
  Calendar,
  ShoppingCart,
  Check,
  Trash2,
  Sparkles,
  Info,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { MealType, MealEntry } from '../types/family';
import { canPerformAction, getIngredientsForDish } from '../utils/familyLogic';

const POPULAR_DISHES = [
  'Butter Chicken & Naan',
  'Paneer Tikka & Tawa Paratha',
  'Dal Makhani & Jeera Rice',
  'Special Chicken Biryani',
  'Poha with Peanuts',
  'Aloo Paratha with Curd',
  'Pasta with White Sauce',
  'Idli Sambar with Chutney',
  'Rajma Chawal',
  'Palak Paneer',
];

export const MealPlannerView: React.FC<{ onNavigateTab?: (tab: string) => void }> = ({ onNavigateTab }) => {
  const {
    mealPlans,
    addMealToDay,
    deleteMealFromDay,
    syncMealIngredientsToGrocery,
    syncMealToCalendar,
    currentUser,
  } = useFamily();

  const [selectedDate, setSelectedDate] = useState<string>(mealPlans[0]?.date || '');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [dishName, setDishName] = useState('');
  const [mealType, setMealType] = useState<MealType>('dinner');
  const [notes, setNotes] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');

  const canEdit = canPerformAction(currentUser, 'canEditMealPlan');

  const currentDayPlan = mealPlans.find((d) => d.date === selectedDate) || mealPlans[0];

  const handleOpenAddModal = (dateStr?: string, type?: MealType) => {
    if (dateStr) setSelectedDate(dateStr);
    if (type) setMealType(type);
    setDishName('');
    setNotes('');
    setIngredientsText('');
    setIsAddModalOpen(true);
  };

  const handleDishNameChange = (name: string) => {
    setDishName(name);
    // Auto populate ingredients suggestion if user hasn't typed custom ones
    const autoIngredients = getIngredientsForDish(name);
    setIngredientsText(autoIngredients.join(', '));
  };

  const handleSelectPopularDish = (dish: string) => {
    setDishName(dish);
    const autoIngredients = getIngredientsForDish(dish);
    setIngredientsText(autoIngredients.join(', '));
  };

  const handleSaveMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim() || !selectedDate) return;

    const parsedIngredients = ingredientsText
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    addMealToDay(selectedDate, {
      dishName: dishName.trim(),
      type: mealType,
      notes: notes.trim() || undefined,
      ingredients: parsedIngredients.length > 0 ? parsedIngredients : getIngredientsForDish(dishName),
    });

    setIsAddModalOpen(false);
  };

  // Calculate total meals planned for week
  const totalPlannedMeals = mealPlans.reduce((sum, d) => sum + d.meals.length, 0);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                Weekly Meal Planner
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every member can add dishes, auto-populate groceries & sync to shared calendar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
              {totalPlannedMeals} Dishes Planned This Week
            </span>
            <span className="text-xs text-slate-400">
              Coordinated household eating & grocery planning
            </span>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-600/25 self-start md:self-center transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Family Dish</span>
          </button>
        )}
      </div>

      {/* 7-Day Week Tabs */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {mealPlans.map((day) => {
          const isSelected = day.date === (currentDayPlan?.date || selectedDate);
          const hasMeals = day.meals.length > 0;

          return (
            <button
              key={day.date}
              onClick={() => setSelectedDate(day.date)}
              className={`p-2.5 sm:p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                isSelected
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/25 scale-[1.02]'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-80">
                {day.dayOfWeek.slice(0, 3)}
              </span>
              <span className="text-xs sm:text-sm font-black mt-0.5">
                {day.date.split('-')[2]}
              </span>
              {hasMeals && (
                <div className="flex items-center gap-0.5 mt-1.5">
                  {day.meals.map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-amber-500'
                      }`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day View */}
      {currentDayPlan && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
                {currentDayPlan.dayOfWeek} Meals ({currentDayPlan.date})
              </h2>
              <p className="text-xs text-slate-400">
                Plan breakfast, lunch, snacks and dinner for the household
              </p>
            </div>
            {canEdit && (
              <button
                onClick={() => handleOpenAddModal(currentDayPlan.date)}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Dish for {currentDayPlan.dayOfWeek}</span>
              </button>
            )}
          </div>

          {/* Meals list for the day */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentDayPlan.meals.length === 0 ? (
              <div className="md:col-span-2 text-center py-14 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
                <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  No dishes planned for {currentDayPlan.dayOfWeek} yet
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Suggest a family favorite dish! Ingredients can be synced to groceries in 1 click.
                </p>
                {canEdit && (
                  <button
                    onClick={() => handleOpenAddModal(currentDayPlan.date)}
                    className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Plan a Meal Now</span>
                  </button>
                )}
              </div>
            ) : (
              currentDayPlan.meals.map((meal) => (
                <div
                  key={meal.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Meal type badge & delete */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        {meal.type}
                      </span>
                      {canEdit && (
                        <button
                          onClick={() => deleteMealFromDay(currentDayPlan.date, meal.id)}
                          aria-label={`Delete ${meal.dishName}`}
                          className="p-1 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                      {meal.dishName}
                    </h3>
                    {meal.notes && (
                      <p className="text-xs text-slate-500 mt-1 italic leading-relaxed">
                        "{meal.notes}"
                      </p>
                    )}

                    {/* Ingredients list */}
                    {meal.ingredients.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Required Ingredients:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {meal.ingredients.map((ing, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sync actions & meta */}
                  <div className="mt-4 pt-3 border-t border-slate-150 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        Added by <strong className="text-slate-600 dark:text-slate-300">{meal.addedByName}</strong>
                      </span>
                      <span>
                        {new Date(meal.addedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {/* Button 1: Sync to Groceries */}
                      <button
                        onClick={() => syncMealIngredientsToGrocery(currentDayPlan.date, meal.id)}
                        className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                          meal.syncedToGrocery
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                            : 'bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-700 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {meal.syncedToGrocery ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Ingredients in Grocery List</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Add to Grocery List</span>
                          </>
                        )}
                      </button>

                      {/* Button 2: Sync to Calendar */}
                      <button
                        onClick={() => syncMealToCalendar(currentDayPlan.date, meal.id)}
                        className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                          meal.syncedToCalendar
                            ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
                            : 'bg-slate-100 hover:bg-purple-50 dark:bg-slate-800 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-200 hover:text-purple-700 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {meal.syncedToCalendar ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-purple-600" />
                            <span>Synced to Calendar</span>
                          </>
                        ) : (
                          <>
                            <Calendar className="w-3.5 h-3.5 text-purple-600" />
                            <span>Add to Schedule</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Dish Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-1">
              Add Dish to Meal Plan
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Coordinate what the family wants to eat and auto-generate grocery ingredients.
            </p>

            <form onSubmit={handleSaveMeal} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Day of Week
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-hidden text-slate-800 dark:text-slate-100"
                  >
                    {mealPlans.map((d) => (
                      <option key={d.date} value={d.date}>
                        {d.dayOfWeek} ({d.date})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Meal Type
                  </label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as MealType)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-hidden text-slate-800 dark:text-slate-100"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snacks">Snacks / Tea</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Chicken Biryani, Butter Paneer, Dal Tadka"
                  value={dishName}
                  onChange={(e) => handleDishNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-hidden text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Quick Popular Dishes Suggestions */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Popular Family Choices:
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {POPULAR_DISHES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleSelectPopularDish(d)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:text-amber-800 transition-colors"
                    >
                      + {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ingredients Needed <span className="text-slate-400 font-normal">(comma separated)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Chicken 1kg, Basmati Rice, Spices, Ghee"
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-hidden text-slate-800 dark:text-slate-100"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  💡 These ingredients can be transferred into the family grocery list in 1 click!
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Preparation preferences
                </label>
                <input
                  type="text"
                  placeholder="e.g. Less spicy for kids, make extra for dinner"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-hidden text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/25 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Dish to Plan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
