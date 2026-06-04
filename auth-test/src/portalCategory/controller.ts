import { Request, Response, RequestHandler } from 'express';
import PortalCategoryService from './service';

class portalCategoryController {
    static getPortalCategory: RequestHandler = async (req, res) => {
        try {
            const filterByName = req.query.name as string | null; // Explicitly type as string | null
            const categories = await PortalCategoryService.getPortalCategoryService(filterByName);
            res.json({status: "success",message: "Portals retrieved successfully", portals: categories});
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'An unknown error occurred' });
            }
        }
    }


  

        static getPortalCategoryHistory: RequestHandler = async (req, res) => {
            try {
                const categories = await PortalCategoryService.getPortalCategoryHistoryService();
                res.json({ status: "success", message: "Portals retrieved successfully", categories });
              } catch (error) {
                if (error instanceof Error) {
                    res.status(500).json({ error: error.message });
                } else {
                    res.status(500).json({ error: 'An unknown error occurred' });
                }
              }
        }
    
      
    
}

export default portalCategoryController;