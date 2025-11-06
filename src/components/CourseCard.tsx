import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp } from "lucide-react";
import { Course } from "@/types/course";
import { Link } from "react-router-dom";

interface CourseCardProps {
  course: Course;
}

const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <Card className="group hover:shadow-[var(--shadow-elevated)] transition-all duration-300">
      <div className="relative h-48 overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/10 to-accent/10">
        <img 
          src={course.image} 
          alt={course.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {course.featured && (
          <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground">
            Featured
          </Badge>
        )}
      </div>
      
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">{course.category}</Badge>
          <Badge variant="secondary">{course.level}</Badge>
        </div>
        <CardTitle className="group-hover:text-primary transition-colors">
          {course.title}
        </CardTitle>
        <CardDescription>{course.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>{course.modules.length} Modules</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-primary">{course.price.toLocaleString()} XAF</p>
          <p className="text-xs text-muted-foreground">One-time payment</p>
        </div>
        <Link to={`/courses/${course.id}`}>
          <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
            Learn More
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
