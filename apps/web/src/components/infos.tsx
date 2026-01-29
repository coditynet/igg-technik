import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


export function Infos() {
  return (
    <div>
      <h2 className="text-4xl font-bold text-black dark:text-white flex justify-center mt-8">
        INFOS
      </h2>

      <div className="flex justify-center mt-8">
        <Card className="w-88 sm:w-md bg-white dark:bg-neutral-900 
                         border border-neutral-200 dark:border-neutral-800 
                         shadow-md rounded-2xl">
          
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-semibold text-black dark:text-white">
              WIP
            </CardTitle>
          </CardHeader>

          <CardContent className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed space-y-3">
            <p>
              Hallo!
              <br />
              Wir haben im Laufe der letzten Monate diese Website entworfen.
              Die aktuelle Version ist zwar funktionsfähig, wird aber noch stark
              bearbeitet.
            </p>

            <p>
              <span className="font-medium text-black dark:text-white">
                Und wie geht das jetzt?
              </span>
              <br />
              1. Schreiben Sie uns einfach eine Mail an:
            </p>

            <a
              href="mailto:event@igg.codity.app"
              className="inline-block font-medium underline underline-offset-4
                         text-black dark:text-white hover:opacity-80 transition"
            >
              event@igg.codity.app
            </a>
            <p>2. kommt shcon noch😥</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}