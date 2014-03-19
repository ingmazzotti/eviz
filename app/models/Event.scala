package models

	case class Event( 
		//Properties
		id: Long, 
		fromdate: Long, 
		todate: Long, 
		summary: String, 
		id_flow:Long, 
		longitude:Double, 
		latitude:Double, 
		licenza: String,
		link: String,
		image: String,
		description: String,
		category: String,
		clicksVal: Long) {

		var clicks=clicksVal;

	    def incrementClicks = {
	    	clicks = clicks+1
	    }
	}



		//Object companion
		object Event { 

			import play.api.libs.json._
			import play.api.db._
			import play.api.Play.current
			import anorm._
			import anorm.SqlParser._

			val event = {
  				get[Long]("id_event") ~ 
  				get[Long]("fromdate") ~ 
  				get[Long]("todate") ~ 
  				get[String]("summary") ~
  				get[Long]("id_flow") ~
  				get[Double]("longitude") ~
  				get[Double]("latitude") ~
  				get[String]("licenza") ~
  				get[String]("link") ~
  				get[String]("image") ~
  				get[String]("description") ~
  				get[String]("category") ~
  				get[Long]("clicks") map {
    				case id~fromdate~todate~summary~id_flow~longitude~latitude~
    				     licenza~link~image~description~category~clicksVal => 
    				     Event(id, fromdate,todate,summary,id_flow,longitude,latitude,
    				     	licenza,link,image,description,category,clicksVal)
  				}
			}

			implicit val eventWrites = new Writes[Event] {
			
				def writes(event: Event) = Json.obj(
					"id" -> event.id,
					"fromdate" -> event.fromdate,
					"todate" -> event.todate,
					"summary" -> event.summary,
					"clicks" -> event.clicks,
					"id_flow" -> event.id_flow,
					"longitude" -> event.longitude,
					"latitude" -> event.latitude,
					"licenza" -> event.licenza,
					"link" -> event.link,
					"image" -> event.image,
					"description" -> event.description,
					"category" -> event.category
				)
			}

			/*
			var events = Array(
				Event(1,20140301,20140301,"Mostra",25),
		        Event(2,20140301,20140304,"Partita",10),
		        Event(3,20140302,20140305,"Flashmob",0),
		        Event(4,20140303,20140328,"Esposizione",8),
		        Event(5,20140304,20140305,"Degustazioni",14),
		        Event(6,20140315,20140316,"Cinema",20),
		        Event(7,20140316,20140317,"Festival",3),
		        Event(8,20140329,20140329,"Festa in piazza",3),
		        Event(9,20140329,20140410,"Summit",3),
		        Event(10,20140401,20140402,"Workshop",3),
		        Event(11,20140405,20140408,"Hackaton",3),
		        Event(12,20140408,20140408,"Premiazione",3),
		        Event(13,20140415,20140415,"Mangiatona",3),
		        Event(14,20140416,20140425,"Cenone",3)
			)
*/

		//DAO methods
		//def getAll = events.toList.sortBy(_.fromdate)
		//def getAll = events

		

		def getAll(id_flow: Long): List[Event] = DB.withConnection { implicit c =>
  			SQL("""select e.id_event, e.fromdate, e.todate, e.summary, e.id_flow, e.longitude, e.latitude,
  			       e.licenza,e.link,e.image,e.description,coalesce(e.category,'') as category, coalesce(c.clicks,0) as clicks 
  				   from events as e left outer join
                   (select id_event, count(clicks)  as clicks from clicks group by id_event) as c
                   on e.id_event = c.id_event where e.id_flow = {id_flow}  
                   order by e.fromdate, e.todate""").on("id_flow"->id_flow).as(event *)
		}



		def increment(id_event: Long, id_flow: Long, id_user: String): Int = DB.withConnection { implicit c =>
			val count: Long = 
				SQL("select count(*) from clicks where id_event = {id_event} and id_flow = {id_flow} and id_user =  {id_user}").on(
				"id_event"->id_event).on("id_flow"->id_flow).on("id_user"->id_user).as(scalar[Long].single)

			if(count > 0 ) {
				return -1
			} 

			SQL("""insert into clicks (id_user, id_event, id_flow) 
				values ({id_user},{id_event},{id_flow})""").on(
				"id_user"->id_user).on("id_event"->id_event).on("id_flow"->id_flow).executeUpdate()

			return 0
		}

		/*
		def increment(id: Long) {
			for(ev <- events) {
				if(ev.id == id) {
					ev.incrementClicks
				}
			}
		}
		*/
}