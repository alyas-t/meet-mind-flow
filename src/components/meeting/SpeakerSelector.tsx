
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { UserCircle, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SpeakerSelectorProps {
  onSelectSpeaker: (speaker: string) => void;
  currentSpeaker?: string;
}

const SpeakerSelector: React.FC<SpeakerSelectorProps> = ({ onSelectSpeaker, currentSpeaker }) => {
  const [speakers, setSpeakers] = useState<string[]>(["You", "Team Member"]);
  const [newSpeaker, setNewSpeaker] = useState<string>("");

  const handleAddSpeaker = () => {
    if (newSpeaker.trim() && !speakers.includes(newSpeaker.trim())) {
      setSpeakers([...speakers, newSpeaker.trim()]);
      setNewSpeaker("");
    }
  };

  const handleRemoveSpeaker = (speaker: string) => {
    setSpeakers(speakers.filter(s => s !== speaker));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <UserCircle className="h-4 w-4" />
          <span>{currentSpeaker || "Select Speaker"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <h4 className="font-medium">Select Speaker</h4>
          <div className="flex flex-wrap gap-2">
            {speakers.map((speaker) => (
              <Badge 
                key={speaker} 
                variant={currentSpeaker === speaker ? "default" : "outline"}
                className="cursor-pointer flex items-center gap-1"
              >
                <span onClick={() => onSelectSpeaker(speaker)}>{speaker}</span>
                {speakers.length > 1 && (
                  <X 
                    className="h-3 w-3 hover:text-red-500" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSpeaker(speaker);
                    }}
                  />
                )}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Add new speaker"
              value={newSpeaker}
              onChange={(e) => setNewSpeaker(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddSpeaker();
                }
              }}
              className="text-sm"
            />
            <Button 
              size="icon" 
              variant="ghost"
              onClick={handleAddSpeaker}
              disabled={!newSpeaker.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SpeakerSelector;
