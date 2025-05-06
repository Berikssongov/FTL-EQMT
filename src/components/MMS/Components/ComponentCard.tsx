// MMS/Components/ComponentCard.tsx
import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

interface ComponentCardProps {
  name: string;
  category: string;
  status: string;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ name, category, status }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {category}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Status: {status}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ComponentCard;
