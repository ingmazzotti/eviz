import sbt._
import Keys._
import play.Project._

object ApplicationBuild extends Build {

    val appName         = "eviz"
    val appVersion      = "0.1"

    val appDependencies = Seq(
		"postgresql" % "postgresql" % "9.1-901.jdbc4"
	)

    val main = play.Project(appName, appVersion, appDependencies).settings(
      // Add your own project settings here      
    )

}

