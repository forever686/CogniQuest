import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, CheckCircle2, XCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface DragSortTemplateProps {
    data: {
        options: string[];
        correctOrder: string[];
    };
    hint?: string;
    onComplete?: (success: boolean) => void;
}

interface SortableItemProps {
    id: string;
    content: string;
    isCorrect?: boolean | null;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, content, isCorrect }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={clsx(
                "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 select-none touch-none",
                isDragging ? "bg-accent/20 border-accent shadow-lg z-10" : "bg-white dark:bg-slate-800 border-border hover:border-accent/50",
                isCorrect === true && "border-green-500 bg-green-50 dark:bg-green-900/20",
                isCorrect === false && "border-red-500 bg-red-50 dark:bg-red-900/20"
            )}
        >
            <GripVertical className="text-text-secondary cursor-grab active:cursor-grabbing" />
            <span className="font-medium text-text-primary flex-1">{content}</span>
            {isCorrect === true && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            {isCorrect === false && <XCircle className="w-5 h-5 text-red-500" />}
        </div>
    );
};

const DragSortTemplate: React.FC<DragSortTemplateProps> = ({ data, hint, onComplete }) => {
    const [items, setItems] = useState(data.options || []);
    const [submitted, setSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over.id as string);
                return arrayMove(items, oldIndex, newIndex);
            });
            setSubmitted(false);
            setIsCorrect(null);
        }
    };

    const checkAnswer = () => {
        const currentOrder = items;
        const correctOrder = data.correctOrder;
        const correct = JSON.stringify(currentOrder) === JSON.stringify(correctOrder);
        setIsCorrect(correct);
        setSubmitted(true);

        if (correct && onComplete) {
            onComplete(true);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="mb-4 flex justify-between items-center">
                <h4 className="font-semibold text-text-primary">Arrange in correct order:</h4>
                {hint && (
                    <div className="group relative">
                        <span className="text-xs text-accent cursor-help border-b border-dotted border-accent">Hint?</span>
                        <div className="absolute right-0 top-6 w-48 p-2 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            {hint}
                        </div>
                    </div>
                )}
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-2">
                        {items.map((id) => (
                            <SortableItem
                                key={id}
                                id={id}
                                content={id}
                                isCorrect={submitted ? (data.correctOrder.indexOf(id) === items.indexOf(id) ? true : false) : null}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <button
                onClick={checkAnswer}
                disabled={submitted && isCorrect === true}
                className={clsx(
                    "mt-6 w-full py-2 rounded-xl font-bold transition-all duration-300",
                    isCorrect === true ? "bg-green-500 text-white" : "bg-accent text-white hover:bg-indigo-500"
                )}
            >
                {isCorrect === true ? "Correct! 🎉" : "Check Order"}
            </button>
        </div>
    );
};

export default DragSortTemplate;
