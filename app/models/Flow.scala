package models

case class Flow(id: Long, description: String)

object Flow {

	import play.api.libs.json._
	import play.api.db._
	import play.api.Play.current
	import anorm._
	import anorm.SqlParser._

	val flow = {
		get[Long]("id_flow") ~
		get[String]("description") map {
			case id_flow~description => Flow(id_flow,description)
		}
	}

	def getFlows(): List[Flow] = DB.withConnection { implicit c =>
  			SQL("""select id_flow, description from flows""").as(flow *)
		}


}