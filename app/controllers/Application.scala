package controllers

import play.api._
import play.api.mvc._
import play.api.libs.json._
import models.Event
import models.Flow

object Application extends Controller {

  def javascriptRoutes = Action { implicit request =>
	  import routes.javascript._
	  Ok(
	    Routes.javascriptRouter("appRoutes")(
	    	routes.javascript.Application.getAll,
	    	routes.javascript.Application.updateEvent,
        routes.javascript.Application.getFlowDescription
	    )
	  ).as("text/javascript")
}

  def index(id_flow: Long) = Action {
    Ok(views.html.index("Eviz",id_flow,-1))
  }

  def getAll(id_flow: Long) = Action {
  	Ok(Json.toJson(Event.getAll(id_flow)))
  }

  def updateEvent(id: Long, id_flow: Long, id_user: String) = Action {
  	val ret = Event.increment(id, id_flow, id_user)
  	if(ret == 0) {
  		Ok(Json.toJson(Event.getAll(id_flow)))
  	}
  	else {
  		BadRequest(Json.toJson(Event.getAll(id_flow)))
  	}
  }

  def getEvent(id: Long, id_flow: Long) = Action {
  	Ok(views.html.index("Eviz",id_flow,id));
  }

  def getFlows() = Action {
  	Ok(views.html.flows("Eviz", Flow.getFlows()))
  }

  def getFlowDescription(id_flow: Long) = Action {
    Ok(Flow.getFlowDescription(id_flow))
  }
}