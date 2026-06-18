import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, GraduationCap, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Cursus, formatXaf } from "@/lib/lms";

interface Props {
  cursus: Cursus;
}

const CursusCard = ({ cursus }: Props) => {
  return (
    <Card className="group hover:shadow-[var(--shadow-elevated)] transition-all duration-300 flex flex-col">
      <div className="relative h-44 overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/10 to-accent/10">
        {cursus.image_url ? (
          <img
            src={cursus.image_url}
            alt={cursus.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <GraduationCap className="h-16 w-16 text-primary/40" />
          </div>
        )}
        {cursus.featured && (
          <Badge className="absolute top-3 right-3 bg-secondary text-secondary-foreground">
            Recommandé
          </Badge>
        )}
        {cursus.certification && (
          <Badge variant="outline" className="absolute top-3 left-3 bg-background/80 backdrop-blur">
            <Award className="h-3 w-3 mr-1" /> Certifiant
          </Badge>
        )}
      </div>

      <CardHeader>
        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
          {cursus.pole && <Badge variant="outline" className="text-xs">{cursus.pole.title}</Badge>}
          {cursus.level && <Badge variant="secondary" className="text-xs">{cursus.level}</Badge>}
        </div>
        <CardTitle className="group-hover:text-primary transition-colors text-lg">{cursus.title}</CardTitle>
        {cursus.description && (
          <CardDescription className="line-clamp-2">{cursus.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{cursus.duration_label || `${cursus.duration_hours} h`}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div>
          <p className="text-xs text-muted-foreground">Tarif cursus</p>
          <p className="text-lg font-bold text-primary">{formatXaf(cursus.price_xaf)}</p>
        </div>
        <Link to={`/courses/${cursus.slug}`}>
          <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
            Voir le cursus
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CursusCard;
